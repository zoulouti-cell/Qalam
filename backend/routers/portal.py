"""Client portal: a private, revocable link per client to follow cases, hearings and invoices."""
import secrets

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from lib import storage
from lib.auth import get_current_user, log_activity
from lib.dates import today_iso
from lib.db import db
from routers.cases import save_upload
from models.schemas import Activity, CaseEvent, ClientPortal, PortalCase, PortalEvent, PortalHearing, PortalInvoice, PortalLink, User

router = APIRouter()


@router.get("/clients/{id}/portal", response_model=PortalLink)
async def get_link(id: str, _: User = Depends(get_current_user)):
    c = await db.clients.find_one({"id": id}, {"_id": 0, "portal_token": 1})
    if c is None:
        raise HTTPException(status_code=404, detail="not found")
    return PortalLink(token=c.get("portal_token", ""))


@router.post("/clients/{id}/portal", response_model=PortalLink)
async def new_link(id: str, user: User = Depends(get_current_user)):
    """Creates (or rotates — the old link stops working) the client's private link."""
    token = secrets.token_urlsafe(24)
    res = await db.clients.update_one({"id": id}, {"$set": {"portal_token": token}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    await log_activity(user, "portal.link", id)
    return PortalLink(token=token)


@router.delete("/clients/{id}/portal")
async def revoke_link(id: str, _: User = Depends(get_current_user)):
    await db.clients.update_one({"id": id}, {"$unset": {"portal_token": ""}})
    return {"ok": True}


async def client_by_token(token: str) -> dict:
    c = await db.clients.find_one({"portal_token": token}, {"_id": 0}) if len(token) >= 20 else None
    if not c:
        raise HTTPException(status_code=404, detail="not found")
    return c


@router.get("/portal/{token}", response_model=ClientPortal)
async def portal(token: str):
    c = await client_by_token(token)
    today = today_iso()
    office = await db.office.find_one({"_id": "office"}) or {}
    cases = await db.cases.find({"client_id": c["id"], "status": {"$ne": "archived"}}, {"_id": 0}).sort("created_at", -1).to_list(100)
    out = []
    for cs in cases:
        # only titles/dates of the log are shared — details only when the office explicitly shares them
        evs = await db.case_events.find({"case_id": cs["id"]}, {"_id": 0}).sort([("date", -1), ("created_at", -1)]).to_list(30)
        hs = await db.appointments.find({"case_id": cs["id"], "date": {"$gte": today}}, {"_id": 0}).sort([("date", 1), ("time", 1)]).to_list(20)
        out.append(PortalCase(
            id=cs["id"], file_number=cs["file_number"], subject=cs["subject"], court=cs.get("court", ""), opponent=cs.get("opponent", ""), status=cs["status"],
            events=[PortalEvent(date=e["date"], title=e["title"], details=e.get("details", "") if e.get("shared") else "",
                                from_client=e.get("from_client", False), attachment_name=e.get("attachment_name", "")) for e in evs],
            hearings=[PortalHearing(date=h["date"], time=h.get("time", ""), title=h["title"], location=h.get("location", "")) for h in hs],
        ))
    invs = await db.invoices.find({"case_id": {"$in": [cs["id"] for cs in cases]}}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return ClientPortal(
        office_name=office.get("name", ""), office_logo_id=office.get("logo_image_id", ""), client_name=c["name"], today=today, cases=out,
        invoices=[PortalInvoice(number=i["number"], title=i["title"], amount_mad=i["amount_mad"], status=i["status"], due_date=i.get("due_date", ""),
                                pay_token=i["token"] if i["status"] == "unpaid" and i.get("pay_amount", 0) > 0 else "") for i in invs],
    )


@router.get("/portal/{token}/logo")
async def portal_logo(token: str):
    await client_by_token(token)
    office = await db.office.find_one({"_id": "office"}) or {}
    att = await db.attachments.find_one({"id": office.get("logo_image_id", "")}, {"_id": 0}) if office.get("logo_image_id") else None
    path = await storage.local_path(att["id"], att.get("storage_path", "")) if att else None
    if not path:
        raise HTTPException(status_code=404, detail="no logo")
    return FileResponse(path, media_type=att["content_type"])


@router.post("/portal/{token}/messages", response_model=PortalEvent)
async def client_message(token: str, case_id: str = Form(...), text: str = Form(""), file: UploadFile | None = File(None)):
    """The client sends a question and/or a document straight into one of their cases."""
    c = await client_by_token(token)
    text = text.strip()[:3000]
    if not text and not file:
        raise HTTPException(status_code=400, detail="empty message")
    case = await db.cases.find_one({"id": case_id, "client_id": c["id"], "status": {"$ne": "archived"}}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="not found")
    att = await save_upload("case", case_id, file) if file else None
    ev = CaseEvent(date=today_iso(), title="وثيقة من الموكل" if att and not text else "رسالة من الموكل", details=text, shared=True, case_id=case_id,
                   created_by=c["name"], from_client=True, seen=False, attachment_id=att.id if att else "", attachment_name=att.filename if att else "")
    await db.case_events.insert_one(ev.model_dump())
    await db.activity.insert_one(Activity(user_name=c["name"], action="portal.message", label=f"{case['file_number']} — {ev.title}").model_dump())
    return PortalEvent(date=ev.date, title=ev.title, details=ev.details, from_client=True, attachment_name=ev.attachment_name)
