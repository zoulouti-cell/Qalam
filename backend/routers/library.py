from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from lib.auth import get_current_user, log_activity
from lib.db import db
from models.schemas import Attachment, LibraryItem, LibraryItemIn, User
from routers.cases import UPLOAD_DIR, save_upload

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
        flt["$or"] = [{"title": rx}, {"content": rx}, {"reference": rx}]
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
        (UPLOAD_DIR / a["id"]).unlink(missing_ok=True)
    await db.attachments.delete_many({"owner_type": "library", "owner_id": id})
    return {"ok": True}


@router.post("/library/{id}/attachments", response_model=Attachment)
async def upload_item_file(id: str, file: UploadFile = File(...), _: User = Depends(get_current_user)):
    if not await db.library.find_one({"id": id}):
        raise HTTPException(status_code=404, detail="not found")
    return await save_upload("library", id, file)
