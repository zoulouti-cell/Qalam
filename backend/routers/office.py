"""Office profile (name + logo) and full backup / restore (admin)."""
import io
import json
import zipfile
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from lib.auth import get_current_user, require_admin
from lib.dates import today_iso
from lib.db import db
from models.schemas import Office, OfficeIn, RestoreResult, User
from lib import storage
from routers.cases import save_upload

router = APIRouter()
OFFICE_ID = "office"
IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp")
# Everything that makes up the office's data. Sessions/OAuth state are deliberately excluded.
BACKUP_COLLECTIONS = [
    "users", "clients", "cases", "case_events", "appointments", "documents", "templates", "library",
    "attachments", "conversations", "letterheads", "office", "activity", "deadlines", "invoices", "counters",
]


async def get_office() -> Office:
    d = await db.office.find_one({"_id": OFFICE_ID}) or {}
    return Office(name=d.get("name", ""), logo_image_id=d.get("logo_image_id", ""), whatsapp_number=d.get("whatsapp_number", ""), email_reminders=d.get("email_reminders", True))


@router.get("/office", response_model=Office)
async def read_office(_: User = Depends(get_current_user)):
    return await get_office()


@router.put("/office", response_model=Office)
async def update_office(body: OfficeIn, _: User = Depends(require_admin)):
    await db.office.update_one({"_id": OFFICE_ID}, {"$set": body.model_dump()}, upsert=True)
    return await get_office()


@router.post("/office/logo", response_model=Office)
async def upload_logo(file: UploadFile = File(...), _: User = Depends(require_admin)):
    if not (file.filename or "").lower().endswith(IMAGE_EXT):
        raise HTTPException(status_code=400, detail="image required (png, jpg, webp)")
    old = (await get_office()).logo_image_id
    att = await save_upload("office", OFFICE_ID, file)
    await db.office.update_one({"_id": OFFICE_ID}, {"$set": {"logo_image_id": att.id}}, upsert=True)
    if old:
        await db.attachments.delete_one({"id": old})
        storage.drop_cache(old)
    return await get_office()


@router.delete("/office/logo", response_model=Office)
async def delete_logo(_: User = Depends(require_admin)):
    old = (await get_office()).logo_image_id
    if old:
        await db.attachments.delete_one({"id": old})
        storage.drop_cache(old)
    await db.office.update_one({"_id": OFFICE_ID}, {"$set": {"logo_image_id": ""}}, upsert=True)
    return await get_office()


@router.get("/backup")
async def download_backup(_: User = Depends(require_admin)):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        meta = {"app": "qalam", "version": 1, "created_at": datetime.now().isoformat(timespec="seconds"), "collections": {}}
        for name in BACKUP_COLLECTIONS:
            docs = await db[name].find({}).to_list(None)
            for d in docs:
                d["_id"] = str(d["_id"])
            meta["collections"][name] = len(docs)
            z.writestr(f"data/{name}.json", json.dumps(docs, ensure_ascii=False, default=str))
        async for a in db.attachments.find({}, {"_id": 0, "id": 1, "storage_path": 1}):
            data = await storage.read(a["id"], a.get("storage_path", ""))
            if data is not None:
                z.writestr(f"uploads/{a['id']}", data)
        z.writestr("qalam-backup.json", json.dumps(meta, ensure_ascii=False, indent=2))
    buf.seek(0)
    fname = f"qalam-backup-{today_iso()}.zip"
    return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": f'attachment; filename="{fname}"'})


@router.post("/backup/restore", response_model=RestoreResult)
async def restore_backup(file: UploadFile = File(...), user: User = Depends(require_admin)):
    try:
        z = zipfile.ZipFile(io.BytesIO(await file.read()))
        json.loads(z.read("qalam-backup.json"))
    except Exception:
        raise HTTPException(status_code=400, detail="not a Qalam backup file")
    counts: dict[str, int] = {}
    for name in BACKUP_COLLECTIONS:
        path = f"data/{name}.json"
        if path not in z.namelist():
            continue
        docs = json.loads(z.read(path))
        for d in docs:
            if name not in ("office", "counters"):
                d.pop("_id", None)
        await db[name].delete_many({})
        if docs:
            await db[name].insert_many(docs)
        counts[name] = len(docs)
    # never lock the restoring admin out
    if not await db.users.find_one({"email": user.email}):
        await db.users.insert_one(user.model_dump())
    files = 0
    for n in z.namelist():
        if n.startswith("uploads/") and not n.endswith("/"):
            att_id = n.split("/", 1)[1]
            meta = await db.attachments.find_one({"id": att_id}, {"content_type": 1}) or {}
            path = await storage.put(att_id, z.read(n), meta.get("content_type", "application/octet-stream"))
            await db.attachments.update_one({"id": att_id}, {"$set": {"storage_path": path}})
            files += 1
    return RestoreResult(collections=counts, files=files)
