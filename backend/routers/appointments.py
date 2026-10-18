from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_user, log_activity
from lib.db import db
from models.schemas import Appointment, AppointmentIn, User

router = APIRouter()


async def enrich(d: dict) -> Appointment:
    a = Appointment(**d)
    if a.client_id:
        cl = await db.clients.find_one({"id": a.client_id}, {"_id": 0, "name": 1})
        a.client_name = cl["name"] if cl else ""
    if a.case_id:
        cs = await db.cases.find_one({"id": a.case_id}, {"_id": 0, "file_number": 1, "subject": 1})
        a.case_label = f"{cs['file_number']} — {cs['subject']}" if cs else ""
    return a


async def appointments_between(start: str, end: str) -> list[Appointment]:
    docs = await db.appointments.find({"date": {"$gte": start, "$lte": end}}, {"_id": 0}).sort([("date", 1), ("time", 1)]).to_list(2000)
    return [await enrich(d) for d in docs]


@router.get("/appointments", response_model=list[Appointment])
async def list_appointments(start: str = "0000-00-00", end: str = "9999-99-99", _: User = Depends(get_current_user)):
    return await appointments_between(start, end)


@router.post("/appointments", response_model=Appointment)
async def create_appointment(body: AppointmentIn, user: User = Depends(get_current_user)):
    a = Appointment(**body.model_dump())
    await db.appointments.insert_one(a.model_dump(exclude={"client_name", "case_label"}))
    await log_activity(user, "appointment.create", f"{a.title} ({a.date})")
    return await enrich(a.model_dump())


@router.put("/appointments/{id}", response_model=Appointment)
async def update_appointment(id: str, body: AppointmentIn, user: User = Depends(get_current_user)):
    d = await db.appointments.find_one_and_update({"id": id}, {"$set": body.model_dump()}, projection={"_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    await log_activity(user, "appointment.update", f"{body.title} ({body.date})")
    return await enrich(d)


@router.delete("/appointments/{id}")
async def delete_appointment(id: str, _: User = Depends(get_current_user)):
    res = await db.appointments.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}
