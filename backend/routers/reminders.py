"""Daily reminder digest (email to the assigned lawyer + admins, WhatsApp to the office number)."""
import asyncio
import hmac
import logging
import os
from datetime import datetime, timedelta
from html import escape

from fastapi import APIRouter, Depends, HTTPException, Request

from lib import email as mail
from lib import whatsapp
from lib.auth import require_admin
from lib.dates import today_iso
from lib.db import db
from models.schemas import ReminderStatus, User, now_iso

router = APIRouter()
log = logging.getLogger(__name__)
STATE_ID = "reminders"
DEADLINE_WINDOW_DAYS = 3


def _plus(iso: str, n: int) -> str:
    return (datetime.strptime(iso, "%Y-%m-%d").date() + timedelta(days=n)).isoformat()


async def _collect(today: str) -> tuple[list[dict], list[dict]]:
    """Hearings/appointments today+tomorrow and open deadlines due within the window, with case info."""
    appts = await db.appointments.find({"date": {"$in": [today, _plus(today, 1)]}}, {"_id": 0}).sort([("date", 1), ("time", 1)]).to_list(500)
    dls = await db.deadlines.find({"done": False, "due_date": {"$lte": _plus(today, DEADLINE_WINDOW_DAYS)}}, {"_id": 0}).sort("due_date", 1).to_list(500)
    cases = {c["id"]: c async for c in db.cases.find({}, {"_id": 0, "id": 1, "file_number": 1, "subject": 1, "court": 1, "assigned_to": 1})}
    for a in appts:
        a["case"] = cases.get(a.get("case_id", ""), {})
    for d in dls:
        d["case"] = cases.get(d["case_id"], {})
    return appts, dls


def _row(cells: list[str], bold: bool = False) -> str:
    w = "700" if bold else "400"
    return "<tr>" + "".join(f'<td style="padding:8px 10px;border-bottom:1px solid #e7e5e4;font-weight:{w}">{c}</td>' for c in cells) + "</tr>"


def _digest_html(name: str, today: str, appts: list[dict], dls: list[dict], app_url: str) -> str:
    rows_a = "".join(
        _row([escape(a["date"]), escape(a.get("time", "") or "—"), escape(a["title"]), escape(a["case"].get("file_number", "")), escape(a["case"].get("court", "") or a.get("location", ""))])
        for a in appts
    )
    rows_d = "".join(
        _row([escape(d["due_date"]), escape(d["label"]), escape(d["case"].get("file_number", "")), escape(d["case"].get("subject", ""))], bold=d["due_date"] <= today)
        for d in dls
    )
    link = f'<p style="margin:24px 0 0"><a href="{escape(app_url)}/agenda" style="background:#0F5132;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">افتح جدول الجلسات</a></p>' if app_url.startswith("https://") else ""
    def table(head: list[str], rows: str) -> str:
        cells = "".join(f'<td style="padding:8px 10px">{h}</td>' for h in head)
        return f'<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;margin-top:8px"><tr style="background:#0B1F18;color:#E6C766">{cells}</tr>{rows}</table>'

    return (
        '<table role="presentation" width="100%" style="background:#FAF8F3"><tr><td style="padding:24px">'
        '<table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;'
        'font-family:Tahoma,Arial,sans-serif;color:#0B1F18" dir="rtl"><tr><td style="padding:28px">'
        f'<div style="font-size:22px;font-weight:700;color:#0E3B2B">قلم — تذكير اليوم</div>'
        f'<p style="color:#57534E">صباح الخير {escape(name)}، هذه جلسات ومواعيد اليوم والغد والآجال القريبة ({escape(today)}):</p>'
        + (f'<h3 style="margin:20px 0 4px">الجلسات والمواعيد</h3>{table(["التاريخ", "الساعة", "الموضوع", "الملف", "المحكمة"], rows_a)}' if appts else "")
        + (f'<h3 style="margin:20px 0 4px">آجال الطعن</h3>{table(["آخر أجل", "الأجل", "الملف", "الموضوع"], rows_d)}' if dls else "")
        + link
        + f'<p style="font-size:12px;color:#a8a29e;margin-top:28px">رسالة آلية من تطبيق {escape(os.environ.get("EMAIL_FROM_NAME", "Qalam"))} لإدارة مكتب المحاماة. '
        "لا نطلب منك أبداً كلمة مرور أو معطيات بنكية عبر البريد.</p>"
        "</td></tr></table></td></tr></table>"
    )


def _wa_text(today: str, appts: list[dict], dls: list[dict]) -> str:
    lines = [f"قلم — تذكير {today}"]
    for a in appts:
        lines.append(f"• {a['date']} {a.get('time', '')} — {a['title']} {a['case'].get('file_number', '')} {a['case'].get('court', '') or a.get('location', '')}".strip())
    for d in dls:
        lines.append(f"⏳ آخر أجل {d['due_date']}: {d['label']} — {d['case'].get('file_number', '')}")
    return "\n".join(lines)


async def run_digest(app_url: str, only_user: User | None = None) -> dict:
    today = today_iso()
    appts, dls = await _collect(today)
    office = await db.office.find_one({"_id": "office"}) or {}
    sent_mail = sent_wa = 0
    error = ""
    if appts or dls:
        users = [only_user.model_dump()] if only_user else await db.users.find({"active": True}, {"_id": 0}).to_list(500)
        for u in users:
            mine = lambda c: u.get("role") == "admin" or c.get("assigned_to") == u["user_id"]  # noqa: E731
            ua = [a for a in appts if mine(a["case"])]
            ud = [d for d in dls if mine(d["case"])]
            if not (ua or ud) or not mail.configured() or not office.get("email_reminders", True) or not u.get("email"):
                continue
            try:
                await mail.send_email(to=u["email"], subject=f"قلم — جلسات وآجال {today}", html=_digest_html(u.get("name") or u["email"], today, ua, ud, app_url))
                sent_mail += 1
            except mail.EmailPaused as exc:
                error = str(exc)
                break
            except Exception as exc:
                log.warning("digest email to %s failed: %s", u.get("email"), exc)
                error = str(exc)[:300]
        if office.get("whatsapp_number") and whatsapp.configured() and not only_user:
            try:
                await whatsapp.send_whatsapp(office["whatsapp_number"], _wa_text(today, appts, dls))
                sent_wa += 1
            except Exception as exc:
                error = f"WhatsApp: {str(exc)[:250]}"
    state = {"last_run_at": now_iso(), "last_emails": sent_mail, "last_whatsapp": sent_wa, "last_error": error}
    await db.reminder_state.update_one({"_id": STATE_ID}, {"$set": state}, upsert=True)
    return state


def _app_url(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    return f"{proto}://{host}"


@router.post("/cron/daily-reminders", status_code=202)
async def cron_daily(request: Request):
    # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
    secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
    auth = request.headers.get("authorization", "")
    token = auth[7:] if auth.lower().startswith("bearer ") else ""
    if not secret or not token or not hmac.compare_digest(token, secret):
        raise HTTPException(status_code=401, detail="unauthorized")
    try:
        body = await request.json() if (await request.body()) else {}
    except Exception:
        raise HTTPException(status_code=400, detail="invalid body")
    run_id = request.headers.get("x-webhook-id") or (body or {}).get("run_id") or now_iso()
    if await db.cron_runs.find_one({"run_id": run_id}):
        return {"accepted": True, "duplicate": True}
    await db.cron_runs.insert_one({"run_id": run_id, "at": now_iso()})
    asyncio.create_task(run_digest(_app_url(request)))
    return {"accepted": True}


@router.get("/reminders/status", response_model=ReminderStatus)
async def reminder_status(_: User = Depends(require_admin)):
    s = await db.reminder_state.find_one({"_id": STATE_ID}) or {}
    return ReminderStatus(
        email_configured=mail.configured(), whatsapp_configured=whatsapp.configured(),
        last_run_at=s.get("last_run_at", ""), last_emails=s.get("last_emails", 0), last_whatsapp=s.get("last_whatsapp", 0), last_error=s.get("last_error", ""),
    )


@router.post("/reminders/test", response_model=ReminderStatus)
async def reminder_test(request: Request, user: User = Depends(require_admin)):
    """Send today's digest now to the requesting admin only (to preview it)."""
    s = await run_digest(_app_url(request), only_user=user)
    return ReminderStatus(email_configured=mail.configured(), whatsapp_configured=whatsapp.configured(), **s)
