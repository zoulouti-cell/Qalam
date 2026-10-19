from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_user, log_activity
from lib.db import db
import json
import re

from emergentintegrations.llm.chat import StreamDone, TextDelta, UserMessage

from lib.extract import attachment_text
from lib.llm import build_chat
from models.schemas import Deadline, DeadlineIn, DeadlinePatch, DeadlineSuggestion, User

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


SUGGEST_PROMPT = """أنت محامٍ مغربي. اقرأ الحكم/القرار التالي واستخرج ما يلزم لحساب أجل الطعن فيه.
أعد JSON فقط بهذه المفاتيح:
{"kind": أحد ["appeal","cassation","opposition","criminal_appeal","review","custom"] حسب الطعن المناسب (حكم ابتدائي مدني/تجاري → appeal، قرار استئنافي → cassation، حكم غيابي → opposition، حكم جنحي ابتدائي → criminal_appeal),
 "judgment_date": "YYYY-MM-DD أو فارغ", "notified_on": "تاريخ التبليغ YYYY-MM-DD إن ذُكر وإلا فارغ",
 "court": "المحكمة المصدرة", "summary": "سطران: منطوق الحكم ولماذا هذا الطعن"}

النص:
"""


@router.post("/cases/{id}/attachments/{att_id}/suggest-deadline", response_model=DeadlineSuggestion)
async def suggest_deadline(id: str, att_id: str, _: User = Depends(get_current_user)):
    att = await db.attachments.find_one({"id": att_id, "owner_type": "case", "owner_id": id}, {"_id": 0})
    if not att:
        raise HTTPException(status_code=404, detail="not found")
    text = await attachment_text(att)
    if not text:
        raise HTTPException(status_code=422, detail="unreadable document")
    chat = build_chat("You extract structured data from Moroccan court judgments. Output strict JSON only.")
    out = ""
    async for ev in chat.stream_message(UserMessage(text=SUGGEST_PROMPT + text[:60000])):
        if isinstance(ev, TextDelta):
            out += ev.content
        elif isinstance(ev, StreamDone):
            break
    m = re.search(r"\{.*\}", out, re.S)
    try:
        data = json.loads(m.group(0)) if m else {}
    except ValueError:
        data = {}
    clean = lambda v: v if isinstance(v, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", v) else ""  # noqa: E731
    return DeadlineSuggestion(
        kind=data.get("kind", "") if data.get("kind") in {"appeal", "cassation", "opposition", "criminal_appeal", "review", "custom"} else "appeal",
        notified_on=clean(data.get("notified_on")), judgment_date=clean(data.get("judgment_date")),
        court=str(data.get("court", ""))[:200], summary=str(data.get("summary", ""))[:600],
    )
