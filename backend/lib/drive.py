"""Google Drive sync — one Drive account per office, connected by that office's admin.

- App → Drive (instant): case attachments, library files and saved documents (as Google Docs) go into
  "Qalam - قلم" with one subfolder per case; deleting a file in the app moves it to the Drive trash.
- Drive → App (every sync run): files added to a case folder on Drive become case attachments, files replaced
  on Drive are refreshed, files trashed on Drive are removed from the app.
- Live read-only Google Sheets (clients, cases, hearings, invoices) in the "جداول" subfolder.
Scope: full drive (needed to read files the user puts in the folders). Inactive until GOOGLE_CLIENT_ID/SECRET are set.
"""
import asyncio
import csv
import io
import logging
import os
from datetime import datetime, timezone

from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload, MediaIoBaseUpload

from lib import storage
from lib.db import current_office, db, office_id, raw
from models.schemas import Attachment, now_iso

log = logging.getLogger(__name__)
SCOPES = ["https://www.googleapis.com/auth/drive"]
SHEET_MIME = "application/vnd.google-apps.spreadsheet"
MAX_PULL_BYTES = 20 * 1024 * 1024
FOLDER_MIME = "application/vnd.google-apps.folder"
DOC_MIME = "application/vnd.google-apps.document"
CRED_ID = "office"
ROOT_NAME = "Qalam - قلم"
UPLOAD_DIR = __import__("pathlib").Path(__file__).parent.parent / "uploads"
_lock = asyncio.Lock()


def configured() -> bool:
    return bool(os.environ.get("GOOGLE_CLIENT_ID") and os.environ.get("GOOGLE_CLIENT_SECRET"))


def client_config(redirect_uri: str) -> dict:
    return {
        "web": {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID", ""),
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET", ""),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }


async def creds_doc() -> dict | None:
    return await db.drive_credentials.find_one({"_id": CRED_ID})


async def _service():
    d = await creds_doc()
    if not d or not configured():
        return None
    creds = Credentials(
        token=d.get("access_token"),
        refresh_token=d.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        scopes=d.get("scopes") or SCOPES,
    )
    if d.get("expiry"):
        creds.expiry = datetime.fromisoformat(d["expiry"]).astimezone(timezone.utc).replace(tzinfo=None)
    if not creds.valid and creds.refresh_token:
        await asyncio.to_thread(creds.refresh, GoogleRequest())
        await db.drive_credentials.update_one(
            {"_id": CRED_ID},
            {"$set": {"access_token": creds.token, "expiry": creds.expiry.replace(tzinfo=timezone.utc).isoformat() if creds.expiry else None}},
        )
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def _create_folder(svc, name: str, parent: str | None) -> str:
    body = {"name": name, "mimeType": FOLDER_MIME, **({"parents": [parent]} if parent else {})}
    return svc.files().create(body=body, fields="id").execute()["id"]


async def _folder(svc, key: str, name: str) -> str:
    """Folder ids are cached in Mongo."""
    root = (await creds_doc() or {}).get("root_folder_id")
    if not root:
        root = await asyncio.to_thread(_create_folder, svc, ROOT_NAME, None)
        await db.drive_credentials.update_one({"_id": CRED_ID}, {"$set": {"root_folder_id": root}})
    if key == "root":
        return root
    f = await db.drive_folders.find_one({"key": key})
    if f:
        return f["folder_id"]
    fid = await asyncio.to_thread(_create_folder, svc, name, root)
    await db.drive_folders.insert_one({"key": key, "folder_id": fid})
    return fid


async def _target_folder(svc, case_id: str, fallback_key: str, fallback_name: str) -> str:
    if case_id:
        cs = await db.cases.find_one({"id": case_id}, {"_id": 0, "file_number": 1, "subject": 1})
        if cs:
            return await _folder(svc, f"case:{case_id}", f"{cs['file_number']} — {cs.get('subject', '')}"[:120])
    return await _folder(svc, fallback_key, fallback_name)


def _upload(svc, file_id: str | None, meta: dict, data: bytes, mime: str) -> dict:
    media = MediaIoBaseUpload(io.BytesIO(data), mimetype=mime, resumable=False)
    fields = "id,md5Checksum,modifiedTime"
    if file_id:
        return svc.files().update(fileId=file_id, media_body=media, body={"name": meta["name"]}, fields=fields).execute()
    return svc.files().create(body=meta, media_body=media, fields=fields).execute()


async def push_attachment(att_id: str) -> None:
    att = await db.attachments.find_one({"id": att_id}, {"_id": 0})
    if not att or att.get("drive_file_id") or att["owner_type"] not in ("case", "library") or att.get("office_id") == "":
        return
    svc = await _service()
    path = await storage.local_path(att_id, att.get("storage_path", ""))
    if not svc or not path:
        return
    if att["owner_type"] == "case":
        folder = await _target_folder(svc, att["owner_id"], "misc", "مرفقات")
    else:
        folder = await _folder(svc, "library", "المكتبة القانونية")
    f = await asyncio.to_thread(_upload, svc, None, {"name": att["filename"], "parents": [folder]}, path.read_bytes(), att["content_type"])
    await db.attachments.update_one({"id": att_id}, {"$set": {"drive_file_id": f["id"], "drive_md5": f.get("md5Checksum", ""), "drive_modified": f.get("modifiedTime", "")}})


async def push_document(doc_id: str) -> None:
    d = await db.documents.find_one({"id": doc_id}, {"_id": 0})
    if not d:
        return
    svc = await _service()
    if not svc:
        return
    folder = await _target_folder(svc, d.get("case_id", ""), "documents", "الوثائق")
    html = f'<html><head><meta charset="utf-8"></head><body dir="rtl">{d.get("content", "")}</body></html>'
    meta = {"name": d["title"], "mimeType": DOC_MIME, "parents": [folder]}
    try:
        f = await asyncio.to_thread(_upload, svc, d.get("drive_file_id"), meta, html.encode("utf-8"), "text/html")
    except Exception:
        if not d.get("drive_file_id"):
            raise
        f = await asyncio.to_thread(_upload, svc, None, meta, html.encode("utf-8"), "text/html")  # file removed on Drive
    await db.documents.update_one({"id": doc_id}, {"$set": {"drive_file_id": f["id"], "drive_synced_at": now_iso()}})


def _trash(svc, file_id: str) -> None:
    try:
        svc.files().update(fileId=file_id, body={"trashed": True}).execute()
    except HttpError as e:
        if e.resp.status != 404:
            raise


# ---- Drive → app ----
def _list(svc, folder: str) -> list[dict]:
    out, token = [], None
    while True:
        r = svc.files().list(q=f"'{folder}' in parents and trashed = false", pageSize=200, pageToken=token,
                             fields="nextPageToken, files(id,name,mimeType,md5Checksum,modifiedTime,size)").execute()
        out += r.get("files", [])
        token = r.get("nextPageToken")
        if not token:
            return out


def _download(svc, f: dict) -> tuple[bytes, str, str]:
    """Binary files as-is; Google Docs/Sheets/Slides exported to PDF."""
    if f["mimeType"].startswith("application/vnd.google-apps."):
        req, name, mime = svc.files().export_media(fileId=f["id"], mimeType="application/pdf"), f"{f['name']}.pdf", "application/pdf"
    else:
        req, name, mime = svc.files().get_media(fileId=f["id"]), f["name"], f["mimeType"]
    buf = io.BytesIO()
    dl = MediaIoBaseDownload(buf, req)
    done = False
    while not done:
        _, done = dl.next_chunk()
    return buf.getvalue(), name, mime


def _gone(svc, file_id: str) -> bool:
    try:
        return bool(svc.files().get(fileId=file_id, fields="trashed").execute().get("trashed"))
    except HttpError as e:
        return e.resp.status == 404


async def _store(att: Attachment, data: bytes, extra: dict) -> None:
    path = await storage.put(att.id, data, att.content_type)
    await db.attachments.insert_one({**att.model_dump(), "storage_path": path, **extra})


async def pull_case(svc, case_id: str, folder_id: str) -> int:
    files = [f for f in await asyncio.to_thread(_list, svc, folder_id) if f["mimeType"] != FOLDER_MIME]
    by_id = {f["id"]: f for f in files}
    atts = await db.attachments.find({"owner_type": "case", "owner_id": case_id, "drive_file_id": {"$exists": True}}, {"_id": 0}).to_list(2000)
    docs = {d["drive_file_id"] async for d in db.documents.find({"drive_file_id": {"$exists": True}}, {"drive_file_id": 1})}
    known = {a["drive_file_id"] for a in atts} | docs
    changes = 0
    for a in atts:  # replaced or trashed on Drive
        f = by_id.get(a["drive_file_id"])
        if f is None:
            if await asyncio.to_thread(_gone, svc, a["drive_file_id"]):
                await db.attachments.delete_one({"id": a["id"]})
                storage.drop_cache(a["id"])
                changes += 1
        elif f.get("md5Checksum") and a.get("drive_md5") and f["md5Checksum"] != a["drive_md5"] and int(f.get("size", 0)) <= MAX_PULL_BYTES:
            data, _, _ = await asyncio.to_thread(_download, svc, f)
            storage.drop_cache(a["id"])
            path = await storage.put(a["id"], data, a["content_type"])
            await db.attachments.update_one({"id": a["id"]}, {"$set": {"storage_path": path, "size": len(data), "drive_md5": f["md5Checksum"], "drive_modified": f.get("modifiedTime", ""), "text": None}})
            changes += 1
    for f in files:  # new on Drive
        if f["id"] in known or int(f.get("size", 0) or 0) > MAX_PULL_BYTES:
            continue
        data, name, mime = await asyncio.to_thread(_download, svc, f)
        att = Attachment(owner_type="case", owner_id=case_id, filename=name, content_type=mime, size=len(data))
        await _store(att, data, {"drive_file_id": f["id"], "drive_md5": f.get("md5Checksum", ""), "drive_modified": f.get("modifiedTime", ""), "source": "drive"})
        changes += 1
    return changes


async def pull_all(svc) -> int:
    n = 0
    async for fo in db.drive_folders.find({"key": {"$regex": "^case:"}}, {"_id": 0}):
        case_id = fo["key"][5:]
        if await db.cases.find_one({"id": case_id}, {"_id": 1}):
            n += await pull_case(svc, case_id, fo["folder_id"])
    return n


# ---- live read-only sheets ----
STATUS_AR = {"ongoing": "جارية", "postponed": "مؤجلة", "judged": "محكومة", "archived": "مؤرشفة"}


async def _sheet_rows() -> dict[str, list[list[str]]]:
    clients = await db.clients.find({}, {"_id": 0}).sort("name", 1).to_list(5000)
    cnames = {c["id"]: c["name"] for c in clients}
    cases = await db.cases.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    files = {c["id"]: c["file_number"] for c in cases}
    users = {u["user_id"]: u.get("name") or u["email"] async for u in raw.users.find({"office_id": office_id()}, {"_id": 0, "user_id": 1, "name": 1, "email": 1})}
    appts = await db.appointments.find({}, {"_id": 0}).sort([("date", -1), ("time", -1)]).to_list(5000)
    invs = await db.invoices.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return {
        "الموكلون": [["الاسم", "الهاتف", "البريد", "العنوان", "رقم البطاقة", "ملاحظات"]]
        + [[c["name"], c.get("phone", ""), c.get("email", ""), c.get("address", ""), c.get("id_number", ""), c.get("notes", "")] for c in clients],
        "الملفات": [["رقم الملف", "الموضوع", "الموكل", "المحكمة", "الخصم", "الحالة", "المحامي المكلف", "تاريخ الفتح"]]
        + [[c["file_number"], c["subject"], cnames.get(c.get("client_id", ""), ""), c.get("court", ""), c.get("opponent", ""), STATUS_AR.get(c.get("status", ""), c.get("status", "")),
            users.get(c.get("assigned_to", ""), ""), c.get("created_at", "")[:10]] for c in cases],
        "الجلسات والمواعيد": [["التاريخ", "الساعة", "النوع", "العنوان", "الملف", "المكان"]]
        + [[a["date"], a.get("time", ""), {"hearing": "جلسة", "meeting": "موعد"}.get(a.get("kind", ""), "أخرى"), a["title"], files.get(a.get("case_id", ""), ""), a.get("location", "")] for a in appts],
        "الفواتير": [["الرقم", "البيان", "الملف", "المبلغ (درهم)", "الحالة", "تاريخ الاستحقاق", "تاريخ الأداء"]]
        + [[i.get("number", ""), i["title"], files.get(i.get("case_id", ""), ""), f"{i.get('amount_mad', 0):.2f}", "مؤداة" if i.get("status") == "paid" else "غير مؤداة",
            i.get("due_date", ""), (i.get("paid_at") or "")[:10]] for i in invs],
    }


async def push_sheets(svc) -> None:
    folder = await _folder(svc, "sheets", "جداول — قراءة فقط")
    for title, rows in (await _sheet_rows()).items():
        buf = io.StringIO()
        csv.writer(buf).writerows(rows)
        data = buf.getvalue().encode("utf-8")
        rec = await db.drive_folders.find_one({"key": f"sheet:{title}"})
        meta = {"name": title, "mimeType": SHEET_MIME, "parents": [folder]}
        try:
            f = await asyncio.to_thread(_upload, svc, rec["folder_id"] if rec else None, meta, data, "text/csv")
        except HttpError:
            if not rec:
                raise
            f = await asyncio.to_thread(_upload, svc, None, meta, data, "text/csv")  # sheet deleted on Drive
        await db.drive_folders.update_one({"key": f"sheet:{title}"}, {"$set": {"folder_id": f["id"]}}, upsert=True)


async def _record(err: str) -> None:
    await db.drive_credentials.update_one({"_id": CRED_ID}, {"$set": {"last_error": err[:300], "last_sync_at": now_iso()}})


def schedule(kind: str, id: str) -> None:
    """Fire-and-forget push after an upload/save/delete; never breaks the request.
    kind: "attachment" | "document" (push by app id) or "trash" (Drive file id)."""

    async def run():
        if not configured() or not await creds_doc():
            return
        async with _lock:
            try:
                if kind == "trash":
                    svc = await _service()
                    if svc:
                        await asyncio.to_thread(_trash, svc, id)
                else:
                    await (push_attachment(id) if kind == "attachment" else push_document(id))
                await _record("")
            except Exception as exc:
                log.warning("drive %s failed: %s", kind, exc)
                await _record(str(exc))

    asyncio.create_task(run())


def _pending_filters() -> tuple[dict, dict]:
    att = {"owner_type": {"$in": ["case", "library"]}, "drive_file_id": {"$exists": False}}
    doc = {"$or": [{"drive_synced_at": {"$exists": False}}, {"$expr": {"$gt": ["$updated_at", "$drive_synced_at"]}}]}
    return att, doc


async def counts() -> tuple[int, int]:
    att_f, doc_f = _pending_filters()
    pending = await db.attachments.count_documents(att_f) + await db.documents.count_documents(doc_f)
    synced = await db.attachments.count_documents({"drive_file_id": {"$exists": True}}) + await db.documents.count_documents({"drive_file_id": {"$exists": True}})
    return synced, pending


async def sync_all() -> None:
    """Full two-way pass for the current office: push pending → pull Drive changes → refresh sheets."""
    if not configured() or not await creds_doc():
        return
    att_f, doc_f = _pending_filters()
    async with _lock:
        try:
            async for a in db.attachments.find(att_f, {"id": 1}):
                await push_attachment(a["id"])
            async for d in db.documents.find(doc_f, {"id": 1}):
                await push_document(d["id"])
            svc = await _service()
            if svc:
                await pull_all(svc)
                await push_sheets(svc)
            await _record("")
        except Exception as exc:
            log.warning("drive sync failed: %s", exc)
            await _record(str(exc))


async def sync_all_offices() -> None:
    """Cron: run sync_all for every office that connected its Drive."""
    async for c in raw.drive_credentials.find({}, {"office_id": 1}):
        o = await raw.offices.find_one({"id": c.get("office_id")}, {"_id": 0, "active": 1})
        if not o or o.get("active") is False:
            continue
        token = current_office.set(c["office_id"])
        try:
            await sync_all()
        finally:
            current_office.reset(token)
