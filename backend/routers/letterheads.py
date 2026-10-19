import asyncio
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from starlette.datastructures import Headers

from lib.auth import get_current_user, log_activity, require_admin
from lib.db import db
from models.schemas import ImageSlot, Letterhead, LetterheadIn, User
from lib import storage
from routers.cases import save_upload

router = APIRouter()

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp"}


async def get_or_404(id: str) -> dict:
    d = await db.letterheads.find_one({"id": id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return d


async def clear_other_defaults(keep_id: str) -> None:
    await db.letterheads.update_many({"id": {"$ne": keep_id}}, {"$set": {"is_default": False}})


@router.get("/letterheads", response_model=list[Letterhead])
async def list_letterheads(_: User = Depends(get_current_user)):
    docs = await db.letterheads.find({}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return [Letterhead(**d) for d in docs]


@router.post("/letterheads", response_model=Letterhead)
async def create_letterhead(body: LetterheadIn, user: User = Depends(require_admin)):
    lh = Letterhead(**body.model_dump())
    if await db.letterheads.count_documents({}) == 0:
        lh.is_default = True  # the first letterhead becomes the default
    await db.letterheads.insert_one(lh.model_dump())
    if lh.is_default:
        await clear_other_defaults(lh.id)
    await log_activity(user, "letterhead.create", lh.name)
    return lh


@router.put("/letterheads/{id}", response_model=Letterhead)
async def update_letterhead(id: str, body: LetterheadIn, user: User = Depends(require_admin)):
    await get_or_404(id)
    d = await db.letterheads.find_one_and_update({"id": id}, {"$set": body.model_dump()}, projection={"_id": 0}, return_document=True)
    if body.is_default:
        await clear_other_defaults(id)
    await log_activity(user, "letterhead.update", body.name)
    return Letterhead(**d)


@router.delete("/letterheads/{id}")
async def delete_letterhead(id: str, _: User = Depends(require_admin)):
    d = await get_or_404(id)
    for att_id in (d.get(f"{s}_image_id") for s in ("header", "footer", "page", "signature", "stamp")):
        if att_id:
            await db.attachments.delete_one({"id": att_id})
            storage.drop_cache(att_id)
    await db.letterheads.delete_one({"id": id})
    await db.documents.update_many({"letterhead_id": id}, {"$set": {"letterhead_id": ""}})
    return {"ok": True}


def pdf_first_page_png(data: bytes) -> bytes:
    """Render page 1 of a blank letterhead PDF to a 200-dpi PNG used as the page background."""
    import pypdfium2 as pdfium

    pdf = pdfium.PdfDocument(data)
    img = pdf[0].render(scale=200 / 72).to_pil()
    out = io.BytesIO()
    img.save(out, format="PNG", optimize=True)
    return out.getvalue()


@router.post("/letterheads/{id}/image", response_model=Letterhead)
async def upload_image(id: str, slot: ImageSlot, file: UploadFile = File(...), _: User = Depends(require_admin)):
    d = await get_or_404(id)
    name = (file.filename or "").lower()
    if slot == "page" and name.endswith(".pdf"):
        try:
            png = await asyncio.to_thread(pdf_first_page_png, await file.read())
        except Exception:
            raise HTTPException(status_code=400, detail="could not read this PDF")
        base = (file.filename or "letterhead").rsplit(".", 1)[0]
        file = UploadFile(io.BytesIO(png), filename=f"{base}.png", headers=Headers({"content-type": "image/png"}))
    elif not any(name.endswith(e) for e in IMAGE_EXT):
        raise HTTPException(status_code=400, detail="image required (png, jpg, webp)")
    old = d.get(f"{slot}_image_id")
    att = await save_upload("letterhead", id, file)
    if old:
        await db.attachments.delete_one({"id": old})
        storage.drop_cache(old)
    d = await db.letterheads.find_one_and_update({"id": id}, {"$set": {f"{slot}_image_id": att.id}}, projection={"_id": 0}, return_document=True)
    return Letterhead(**d)


@router.delete("/letterheads/{id}/image", response_model=Letterhead)
async def delete_image(id: str, slot: ImageSlot, _: User = Depends(require_admin)):
    d = await get_or_404(id)
    old = d.get(f"{slot}_image_id")
    if old:
        await db.attachments.delete_one({"id": old})
        storage.drop_cache(old)
    d = await db.letterheads.find_one_and_update({"id": id}, {"$set": {f"{slot}_image_id": ""}}, projection={"_id": 0}, return_document=True)
    return Letterhead(**d)
