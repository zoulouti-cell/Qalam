"""Google Drive sync for the office (one Drive account, connected by the admin).

Case attachments and saved documents are copied into a "Qalam" folder, one subfolder per case.
Documents are uploaded as Google Docs (converted from their HTML). Scope: drive.file.
Inactive until GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are set in backend/.env.
"""
import asyncio
import io
import logging
import os
from datetime import datetime, timezone

from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

from lib import storage
from lib.db import db
from models.schemas import now_iso

log = logging.getLogger(__name__)
SCOPES = ["https://www.googleapis.com/auth/drive.file"]
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
    """Folder ids are cached in Mongo (drive.file scope only sees app-created files anyway)."""
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


def _upload(svc, file_id: str | None, meta: dict, data: bytes, mime: str) -> str:
    media = MediaIoBaseUpload(io.BytesIO(data), mimetype=mime, resumable=False)
    if file_id:
        return svc.files().update(fileId=file_id, media_body=media, body={"name": meta["name"]}, fields="id").execute()["id"]
    return svc.files().create(body=meta, media_body=media, fields="id").execute()["id"]


async def push_attachment(att_id: str) -> None:
    att = await db.attachments.find_one({"id": att_id}, {"_id": 0})
    if not att or att.get("drive_file_id") or att["owner_type"] not in ("case", "library"):
        return
    svc = await _service()
    path = await storage.local_path(att_id, att.get("storage_path", ""))
    if not svc or not path:
        return
    if att["owner_type"] == "case":
        folder = await _target_folder(svc, att["owner_id"], "misc", "مرفقات")
    else:
        folder = await _folder(svc, "library", "المكتبة القانونية")
    fid = await asyncio.to_thread(_upload, svc, None, {"name": att["filename"], "parents": [folder]}, path.read_bytes(), att["content_type"])
    await db.attachments.update_one({"id": att_id}, {"$set": {"drive_file_id": fid}})


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
        fid = await asyncio.to_thread(_upload, svc, d.get("drive_file_id"), meta, html.encode("utf-8"), "text/html")
    except Exception:
        if not d.get("drive_file_id"):
            raise
        fid = await asyncio.to_thread(_upload, svc, None, meta, html.encode("utf-8"), "text/html")  # file removed on Drive
    await db.documents.update_one({"id": doc_id}, {"$set": {"drive_file_id": fid, "drive_synced_at": now_iso()}})


async def _record(err: str) -> None:
    await db.drive_credentials.update_one({"_id": CRED_ID}, {"$set": {"last_error": err[:300], "last_sync_at": now_iso()}})


def schedule(kind: str, id: str) -> None:
    """Fire-and-forget push after an upload/save; never breaks the request."""

    async def run():
        if not configured() or not await creds_doc():
            return
        async with _lock:
            try:
                await (push_attachment(id) if kind == "attachment" else push_document(id))
                await _record("")
            except Exception as exc:
                log.warning("drive push failed: %s", exc)
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
    att_f, doc_f = _pending_filters()
    async with _lock:
        try:
            async for a in db.attachments.find(att_f, {"id": 1}):
                await push_attachment(a["id"])
            async for d in db.documents.find(doc_f, {"id": 1}):
                await push_document(d["id"])
            await _record("")
        except Exception as exc:
            log.warning("drive sync failed: %s", exc)
            await _record(str(exc))
