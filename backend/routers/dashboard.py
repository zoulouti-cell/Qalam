from datetime import date, timedelta

from fastapi import APIRouter, Depends

from lib.auth import get_current_user
from lib.dates import today_iso
from lib.db import db
from models.schemas import Activity, Case, Dashboard, DashboardStats, User
from routers.appointments import appointments_between
from routers.cases import enrich as enrich_case

router = APIRouter()


@router.get("/dashboard", response_model=Dashboard)
async def dashboard(_: User = Depends(get_current_user)):
    today = today_iso()
    week_end = (date.fromisoformat(today) + timedelta(days=7)).isoformat()
    todays = await appointments_between(today, today)
    week = [a for a in await appointments_between(today, week_end) if a.date != today]
    active_docs = await db.cases.find({"status": {"$in": ["ongoing", "postponed"]}}, {"_id": 0}).sort("created_at", -1).to_list(6)
    activity = await db.activity.find({}, {"_id": 0}).sort("created_at", -1).to_list(12)
    stats = DashboardStats(
        clients=await db.clients.count_documents({}),
        active_cases=await db.cases.count_documents({"status": {"$in": ["ongoing", "postponed"]}}),
        today_count=len(todays),
        documents=await db.documents.count_documents({}),
    )
    return Dashboard(
        today=today,
        stats=stats,
        today_appointments=todays,
        week_appointments=week,
        active_cases=[await enrich_case(d) for d in active_docs],
        activity=[Activity(**a) for a in activity],
    )
