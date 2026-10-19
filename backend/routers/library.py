from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from lib.auth import get_current_user, log_activity
import asyncio

from lib import drive
from lib.db import db
from lib.extract import attachment_text
from models.schemas import Attachment, LibraryItem, LibraryItemIn, User
from lib import storage
from routers.cases import save_upload

router = APIRouter()


async def with_attachments(d: dict) -> LibraryItem:
    atts = await db.attachments.find({"owner_type": "library", "owner_id": d["id"]}, {"_id": 0}).to_list(50)
    return LibraryItem(**{**d, "attachments": [Attachment(**a) for a in atts]})


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
    item = LibraryItem(**body.model_dump())
    await db.library.insert_one(item.model_dump(exclude={"attachments"}))
    await log_activity(user, "library.create", item.title)
    return item


@router.get("/library/{id}", response_model=LibraryItem)
async def get_item(id: str, _: User = Depends(get_current_user)):
    d = await db.library.find_one({"id": id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return await with_attachments(d)


@router.put("/library/{id}", response_model=LibraryItem)
async def update_item(id: str, body: LibraryItemIn, _: User = Depends(get_current_user)):
    d = await db.library.find_one_and_update({"id": id}, {"$set": body.model_dump()}, projection={"_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return await with_attachments(d)


@router.delete("/library/{id}")
async def delete_item(id: str, _: User = Depends(get_current_user)):
    res = await db.library.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    async for a in db.attachments.find({"owner_type": "library", "owner_id": id}):
        storage.drop_cache(a["id"])
    await db.attachments.delete_many({"owner_type": "library", "owner_id": id})
    return {"ok": True}


@router.post("/library/{id}/attachments", response_model=Attachment)
async def upload_item_file(id: str, file: UploadFile = File(...), _: User = Depends(get_current_user)):
    if not await db.library.find_one({"id": id}):
        raise HTTPException(status_code=404, detail="not found")
    att = await save_upload("library", id, file)
    drive.schedule("attachment", att.id)
    asyncio.create_task(index_file(id, att.model_dump()))
    return att


async def index_file(item_id: str, att: dict) -> None:
    """Extract (or OCR) the uploaded file so library search and the assistant can use its text."""
    text = await attachment_text(att)
    if text:
        item = await db.library.find_one({"id": item_id}, {"file_text": 1}) or {}
        await db.library.update_one({"id": item_id}, {"$set": {"file_text": ((item.get("file_text") or "") + "\n" + text)[:400_000]}})
