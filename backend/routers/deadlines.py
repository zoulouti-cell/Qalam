from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_user, log_activity
from lib.db import db
from models.schemas import Deadline, DeadlineIn, DeadlinePatch, User

router = APIRouter()


async def with_case(d: dict) -> Deadline:
    cs = await db.cases.find_one({"id": d["case_id"]}, {"_id": 0, "file_number": 1, "subject": 1}) or {}
    return Deadline(**{**d, "case_file_number": cs.get("file_number", ""), "case_subject": cs.get("subject", "")})


@router.get("/deadlines", response_model=list[Deadline])
async def list_deadlines(case_id: str = "", open: bool = False, _: User = Depends(get_current_user)):
    flt: dict = {}
    if case_id:
        flt["case_id"] = case_id
    if open:
        flt["done"] = False
    docs = await db.deadlines.find(flt, {"_id": 0}).sort("due_date", 1).to_list(1000)
    return [await with_case(d) for d in docs]


@router.post("/cases/{id}/deadlines", response_model=Deadline)
async def create_deadline(id: str, body: DeadlineIn, user: User = Depends(get_current_user)):
    cs = await db.cases.find_one({"id": id}, {"_id": 0, "file_number": 1})
    if not cs:
        raise HTTPException(status_code=404, detail="case not found")
    d = Deadline(case_id=id, **body.model_dump())
    await db.deadlines.insert_one(d.model_dump(exclude={"case_file_number", "case_subject"}))
    await log_activity(user, "deadline.create", f"{cs['file_number']} — {d.label} ({d.due_date})")
    return await with_case(d.model_dump())


@router.patch("/deadlines/{id}", response_model=Deadline)
async def set_done(id: str, body: DeadlinePatch, _: User = Depends(get_current_user)):
    d = await db.deadlines.find_one_and_update({"id": id}, {"$set": {"done": body.done}}, projection={"_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return await with_case(d)


@router.delete("/deadlines/{id}")
async def delete_deadline(id: str, _: User = Depends(get_current_user)):
    if (await db.deadlines.delete_one({"id": id})).deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}
