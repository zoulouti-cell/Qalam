from fastapi import APIRouter, Depends

from lib.auth import get_current_user
from lib.dates import today_iso
from lib.db import db
from models.schemas import Agenda, AgendaGroup, AgendaItem, User

router = APIRouter()

UNSPECIFIED = "—"


@router.get("/agenda", response_model=Agenda)
async def hearing_agenda(date: str = "", _: User = Depends(get_current_user)):
    """The day's hearings grouped by court, with the case facts a lawyer needs at the bar."""
    day = date or today_iso()
    appts = await db.appointments.find({"date": day, "kind": "hearing"}, {"_id": 0}).sort("time", 1).to_list(500)
    groups: dict[str, list[AgendaItem]] = {}
    for a in appts:
        cs = await db.cases.find_one({"id": a.get("case_id", "")}, {"_id": 0}) if a.get("case_id") else None
        client = None
        if cs and cs.get("client_id"):
            client = await db.clients.find_one({"id": cs["client_id"]}, {"_id": 0, "name": 1})
        elif a.get("client_id"):
            client = await db.clients.find_one({"id": a["client_id"]}, {"_id": 0, "name": 1})
        last = None
        if cs:
            last = await db.case_events.find_one({"case_id": cs["id"]}, {"_id": 0}, sort=[("date", -1), ("created_at", -1)])
        court = ((cs or {}).get("court") or a.get("location") or UNSPECIFIED).strip()
        groups.setdefault(court, []).append(
            AgendaItem(
                appointment_id=a["id"],
                time=a.get("time", ""),
                title=a["title"],
                location=a.get("location", ""),
                case_id=(cs or {}).get("id", ""),
                file_number=(cs or {}).get("file_number", ""),
                subject=(cs or {}).get("subject", ""),
                client_name=(client or {}).get("name", ""),
                opponent=(cs or {}).get("opponent", ""),
                last_event=f"{last['date']}: {last['title']}" if last else "",
            )
        )
    ordered = sorted(groups.items(), key=lambda kv: (kv[0] == UNSPECIFIED, kv[0]))
    return Agenda(date=day, total=len(appts), groups=[AgendaGroup(court=c, items=items) for c, items in ordered])
