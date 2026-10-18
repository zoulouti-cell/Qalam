import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from lib.auth import get_current_user, log_activity
from lib.db import db
from models.schemas import Attachment, Case, CaseEvent, CaseEventIn, CaseIn, User

router = APIRouter()

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXT = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx", ".txt"}
MAX_BYTES = 20 * 1024 * 1024


async def enrich(d: dict) -> Case:
    c = Case(**d)
    if c.client_id:
        cl = await db.clients.find_one({"id": c.client_id}, {"_id": 0, "name": 1})
        c.client_name = cl["name"] if cl else ""
    if c.assigned_to:
        u = await db.users.find_one({"user_id": c.assigned_to}, {"_id": 0, "name": 1, "email": 1})
        c.assigned_name = (u.get("name") or u.get("email", "")) if u else ""
    return c


@router.get("/cases", response_model=list[Case])
async def list_cases(q: str = "", status: str = "", _: User = Depends(get_current_user)):
    flt: dict = {}
    if status:
        flt["status"] = status
    if q:
        rx = {"$regex": q, "$options": "i"}
        flt["$or"] = [{"file_number": rx}, {"subject": rx}, {"court": rx}, {"opponent": rx}]
    docs = await db.cases.find(flt, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [await enrich(d) for d in docs]


@router.post("/cases", response_model=Case)
async def create_case(body: CaseIn, user: User = Depends(get_current_user)):
    c = Case(**body.model_dump())
    await db.cases.insert_one(c.model_dump(exclude={"client_name", "assigned_name"}))
    await log_activity(user, "case.create", f"{c.file_number} — {c.subject}")
    return await enrich(c.model_dump())


@router.get("/cases/{id}", response_model=Case)
async def get_case(id: str, _: User = Depends(get_current_user)):
    d = await db.cases.find_one({"id": id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return await enrich(d)


@router.put("/cases/{id}", response_model=Case)
async def update_case(id: str, body: CaseIn, user: User = Depends(get_current_user)):
    d = await db.cases.find_one_and_update({"id": id}, {"$set": body.model_dump()}, projection={"_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    await log_activity(user, "case.update", f"{body.file_number} — {body.subject}")
    return await enrich(d)


@router.delete("/cases/{id}")
async def delete_case(id: str, user: User = Depends(get_current_user)):
    d = await db.cases.find_one_and_delete({"id": id})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    await db.case_events.delete_many({"case_id": id})
    await log_activity(user, "case.delete", d["file_number"])
    return {"ok": True}


# ---- events (hearings & procedures log) ----
@router.get("/cases/{id}/events", response_model=list[CaseEvent])
async def list_events(id: str, _: User = Depends(get_current_user)):
    docs = await db.case_events.find({"case_id": id}, {"_id": 0}).sort("date", -1).to_list(1000)
    return [CaseEvent(**d) for d in docs]


@router.post("/cases/{id}/events", response_model=CaseEvent)
async def add_event(id: str, body: CaseEventIn, user: User = Depends(get_current_user)):
    case = await db.cases.find_one({"id": id})
    if not case:
        raise HTTPException(status_code=404, detail="not found")
    ev = CaseEvent(**body.model_dump(), case_id=id, created_by=user.name or user.email)
    await db.case_events.insert_one(ev.model_dump())
    await log_activity(user, "case.event", f"{case['file_number']} — {ev.title}")
    return ev


@router.delete("/cases/{id}/events/{event_id}")
async def delete_event(id: str, event_id: str, _: User = Depends(get_current_user)):
    await db.case_events.delete_one({"id": event_id, "case_id": id})
    return {"ok": True}


# ---- attachments (shared by cases & library items) ----
async def save_upload(owner_type: str, owner_id: str, file: UploadFile) -> Attachment:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="unsupported file type")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="file too large")
    att = Attachment(owner_type=owner_type, owner_id=owner_id, filename=file.filename or "file", content_type=file.content_type or "application/octet-stream", size=len(data))
    (UPLOAD_DIR / att.id).write_bytes(data)
    await db.attachments.insert_one(att.model_dump())
    return att


@router.get("/cases/{id}/attachments", response_model=list[Attachment])
async def list_attachments(id: str, _: User = Depends(get_current_user)):
    docs = await db.attachments.find({"owner_type": "case", "owner_id": id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Attachment(**d) for d in docs]


@router.post("/cases/{id}/attachments", response_model=Attachment)
async def upload_attachment(id: str, file: UploadFile = File(...), user: User = Depends(get_current_user)):
    case = await db.cases.find_one({"id": id})
    if not case:
        raise HTTPException(status_code=404, detail="not found")
    att = await save_upload("case", id, file)
    await log_activity(user, "case.attachment", f"{case['file_number']} — {att.filename}")
    return att


@router.get("/attachments/{att_id}")
async def download_attachment(att_id: str, _: User = Depends(get_current_user)):
    d = await db.attachments.find_one({"id": att_id}, {"_id": 0})
    path = UPLOAD_DIR / att_id
    if not d or not path.exists():
        raise HTTPException(status_code=404, detail="not found")
    return FileResponse(path, media_type=d["content_type"], filename=d["filename"], content_disposition_type="inline")


@router.delete("/attachments/{att_id}")
async def delete_attachment(att_id: str, _: User = Depends(get_current_user)):
    await db.attachments.delete_one({"id": att_id})
    (UPLOAD_DIR / att_id).unlink(missing_ok=True)
    return {"ok": True}
