from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from lib.auth import get_current_user, log_activity
import asyncio

from lib import drive
from lib.db import db, raw
from lib.extract import attachment_text
from models.schemas import Attachment, LibraryItem, LibraryItemIn, User
from lib import storage
from routers.cases import save_upload

router = APIRouter()


async def with_attachments(d: dict) -> LibraryItem:
    atts = await db.attachments.find({"owner_type": "library", "owner_id": d["id"]}, {"_id": 0}).to_list(50)
    shared = d.get("office_id") == ""
    return LibraryItem(**{**d, "attachments": [Attachment(**a) for a in atts], "shared": shared, "own": not shared})


async def writable(id: str, user: User) -> tuple[dict, object]:
    """Own items via the office-scoped handle; shared (platform) items only for the platform admin."""
    d = await db.library.find_one({"id": id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    if d.get("office_id") == "":
        if not user.is_platform_admin:
            raise HTTPException(status_code=403, detail="shared library item is read-only")
        return d, raw
    return d, db


@router.get("/library", response_model=list[LibraryItem])
async def list_library(q: str = "", section: str = "", domain: str = "", _: User = Depends(get_current_user)):
    flt: dict = {}
    if section:
        flt["section"] = section
    if domain:
        flt["domain"] = domain
    if q:
        rx = {"$regex": q, "$options": "i"}
        flt["$or"] = [{"title": rx}, {"content": rx}, {"reference": rx}, {"file_text": rx}]
    docs = await db.library.find(flt, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [await with_attachments(d) for d in docs]


@router.post("/library", response_model=LibraryItem)
async def create_item(body: LibraryItemIn, user: User = Depends(get_current_user)):
    shared = body.shared and user.is_platform_admin
    item = LibraryItem(**{**body.model_dump(), "shared": shared, "own": not shared})
    doc = item.model_dump(exclude={"attachments", "shared", "own"})
    await (raw.library.insert_one({**doc, "office_id": ""}) if shared else db.library.insert_one(doc))
    await log_activity(user, "library.create", item.title)
    return item


@router.get("/library/{id}", response_model=LibraryItem)
async def get_item(id: str, _: User = Depends(get_current_user)):
    d = await db.library.find_one({"id": id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return await with_attachments(d)


@router.put("/library/{id}", response_model=LibraryItem)
async def update_item(id: str, body: LibraryItemIn, user: User = Depends(get_current_user)):
    _, h = await writable(id, user)
    d = await h.library.find_one_and_update({"id": id}, {"$set": body.model_dump(exclude={"shared"})}, projection={"_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return await with_attachments(d)


@router.delete("/library/{id}")
async def delete_item(id: str, user: User = Depends(get_current_user)):
    _, h = await writable(id, user)
    await h.library.delete_one({"id": id})
    async for a in h.attachments.find({"owner_type": "library", "owner_id": id}):
        storage.drop_cache(a["id"])
    await h.attachments.delete_many({"owner_type": "library", "owner_id": id})
    return {"ok": True}


@router.post("/library/{id}/attachments", response_model=Attachment)
async def upload_item_file(id: str, file: UploadFile = File(...), user: User = Depends(get_current_user)):
    d, h = await writable(id, user)
    att = await save_upload("library", id, file)
    if h is raw:  # file of a shared item is shared too
        await raw.attachments.update_one({"id": att.id}, {"$set": {"office_id": ""}})
    else:
        drive.schedule("attachment", att.id)
    asyncio.create_task(index_file(id, att.model_dump(), h is raw))
    return att


async def index_file(item_id: str, att: dict, shared: bool = False) -> None:
    """Extract (or OCR) the uploaded file so library search and the assistant can use its text."""
    text = await attachment_text(att)
    h = raw if shared else db
    if text:
        item = await h.library.find_one({"id": item_id}, {"file_text": 1}) or {}
        await h.library.update_one({"id": item_id}, {"$set": {"file_text": ((item.get("file_text") or "") + "\n" + text)[:400_000]}})
