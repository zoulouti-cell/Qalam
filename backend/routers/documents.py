from fastapi import APIRouter, Depends, HTTPException

from lib import drive
from lib.auth import get_current_user, log_activity
from lib.db import db
from lib.llm import LEGAL_SYSTEM, build_chat, sse_stream
from lib.templates_extra import EXTRA_TEMPLATES
from models.schemas import Document, DocumentIn, DraftIn, Template, TemplateIn, User, new_id, now_iso

router = APIRouter()

TEMPLATES = [
    Template(
        key="opening_petition", title_ar="مقال افتتاحي للدعوى", title_en="Opening petition", doc_type="petition",
        content="""إلى السيد رئيس المحكمة الابتدائية بـ ............ المحترم

مقال افتتاحي للدعوى

لفائدة: السيد(ة) ............، الساكن(ة) بـ ............، رقم البطاقة الوطنية ............
ينوب عنه: الأستاذ(ة) ............، المحامي(ة) بهيئة ............

ضد: السيد(ة) ............، الساكن(ة) بـ ............

الموضوع: ............

يتشرف العارض بأن يعرض على أنظار المحكمة الموقرة ما يلي:

الوقائع:
............

في الشكل:
حيث إن المقال قدم وفق الشروط الشكلية المتطلبة قانوناً صفة وأهلية ومصلحة وأداءً، مما يتعين معه قبوله شكلاً.

في الموضوع:
حيث إن ............

لهذه الأسباب:
يلتمس العارض من المحكمة الموقرة:
- في الشكل: قبول المقال.
- في الموضوع: الحكم بـ ............
- تحميل المدعى عليه الصائر.

وتقبلوا فائق التقدير والاحترام.

حرر بـ ............ في ............
الإمضاء""",
    ),
    Template(
        key="reply_memo", title_ar="مذكرة جوابية", title_en="Reply memorandum", doc_type="memo",
        content="""إلى السيد رئيس ............ المحترم

مذكرة جوابية

ملف عدد: ............
الجلسة: ............

لفائدة: ............ (المدعى عليه)
ينوب عنه: الأستاذ(ة) ............

ضد: ............ (المدعي)

يتشرف العارض بأن يدلي بمذكرته الجوابية على المقال الافتتاحي كما يلي:

في الشكل:
............

في الموضوع:
أولاً: ............
ثانياً: ............

لهذه الأسباب:
يلتمس العارض:
- أساساً: التصريح بعدم قبول الدعوى.
- احتياطياً: الحكم برفض الطلب.
- تحميل المدعي الصائر.

وتقبلوا فائق التقدير والاحترام.""",
    ),
    Template(
        key="contract", title_ar="عقد", title_en="Contract", doc_type="contract",
        content="""عقد ............

بين الموقعين أسفله:
الطرف الأول: السيد(ة) ............، رقم البطاقة الوطنية ............، الساكن(ة) بـ ............
الطرف الثاني: السيد(ة) ............، رقم البطاقة الوطنية ............، الساكن(ة) بـ ............

تم الاتفاق والتراضي على ما يلي:

الفصل الأول: موضوع العقد
............

الفصل الثاني: المدة
............

الفصل الثالث: المقابل وطريقة الأداء
............

الفصل الرابع: التزامات الطرفين
............

الفصل الخامس: فسخ العقد
............

الفصل السادس: الاختصاص
في حالة نشوب نزاع، تختص محاكم ............ بالنظر فيه.

حرر بـ ............ في ............ في نظيرين.

إمضاء الطرف الأول                         إمضاء الطرف الثاني""",
    ),
    Template(
        key="notice", title_ar="إنذار", title_en="Formal notice", doc_type="notice",
        content="""إنذار

من: السيد(ة) ............، ينوب عنه الأستاذ(ة) ............، المحامي(ة) بهيئة ............
إلى: السيد(ة) ............، الساكن(ة) بـ ............

الموضوع: إنذار بـ ............

سيدي،
بناءً على ............، وحيث إنكم لم تفوا بالتزامكم المتمثل في ............،
فإننا ننذركم بضرورة ............ داخل أجل ............ من تاريخ توصلكم بهذا الإنذار،
وإلا سنضطر إلى سلوك المساطر القانونية اللازمة لحفظ حقوق موكلنا، مع تحميلكم كافة المصاريف.

وتقبلوا التحية.

حرر بـ ............ في ............
الإمضاء""",
    ),
]


async def case_label(case_id: str) -> str:
    if not case_id:
        return ""
    cs = await db.cases.find_one({"id": case_id}, {"_id": 0, "file_number": 1, "subject": 1})
    return f"{cs['file_number']} — {cs['subject']}" if cs else ""


@router.get("/templates", response_model=list[Template])
async def templates(_: User = Depends(get_current_user)):
    custom = await db.templates.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Template(**{**c, "custom": True}) for c in custom] + TEMPLATES + EXTRA_TEMPLATES


@router.post("/templates", response_model=Template)
async def save_template(body: TemplateIn, user: User = Depends(get_current_user)):
    """Save a document as an office model memo (HTML content)."""
    t = Template(key=f"custom_{new_id()}", title_ar=body.title, title_en=body.title, doc_type=body.doc_type, content=body.content, custom=True)
    await db.templates.insert_one({**t.model_dump(), "created_at": now_iso(), "created_by": user.user_id})
    await log_activity(user, "template.create", body.title)
    return t


@router.delete("/templates/{key}")
async def delete_template(key: str, _: User = Depends(get_current_user)):
    res = await db.templates.delete_one({"key": key})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}


@router.get("/documents", response_model=list[Document])
async def list_documents(case_id: str = "", _: User = Depends(get_current_user)):
    flt = {"case_id": case_id} if case_id else {}
    docs = await db.documents.find(flt, {"_id": 0}).sort("updated_at", -1).to_list(1000)
    return [Document(**{**d, "case_label": await case_label(d.get("case_id", ""))}) for d in docs]


@router.post("/documents", response_model=Document)
async def create_document(body: DocumentIn, user: User = Depends(get_current_user)):
    d = Document(**body.model_dump())
    await db.documents.insert_one(d.model_dump(exclude={"case_label"}))
    await log_activity(user, "document.create", d.title)
    drive.schedule("document", d.id)
    d.case_label = await case_label(d.case_id)
    return d


@router.get("/documents/{id}", response_model=Document)
async def get_document(id: str, _: User = Depends(get_current_user)):
    d = await db.documents.find_one({"id": id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    return Document(**{**d, "case_label": await case_label(d.get("case_id", ""))})


@router.put("/documents/{id}", response_model=Document)
async def update_document(id: str, body: DocumentIn, user: User = Depends(get_current_user)):
    d = await db.documents.find_one_and_update(
        {"id": id}, {"$set": {**body.model_dump(), "updated_at": now_iso()}}, projection={"_id": 0}, return_document=True
    )
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    await log_activity(user, "document.update", body.title)
    drive.schedule("document", id)
    return Document(**{**d, "case_label": await case_label(d.get("case_id", ""))})


@router.delete("/documents/{id}")
async def delete_document(id: str, _: User = Depends(get_current_user)):
    res = await db.documents.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}


@router.post("/documents/draft")
async def ai_draft(body: DraftIn, _: User = Depends(get_current_user)):
    ctx = ""
    if body.case_id:
        cs = await db.cases.find_one({"id": body.case_id}, {"_id": 0})
        if cs:
            client = await db.clients.find_one({"id": cs.get("client_id", "")}, {"_id": 0}) or {}
            ctx = (
                f"\nمعطيات الملف: رقم {cs['file_number']}، الموضوع: {cs['subject']}، المحكمة: {cs.get('court','')}، "
                f"الخصم: {cs.get('opponent','')}، الموكل: {client.get('name','')}، ملاحظات: {cs.get('notes','')}"
            )
    prompt = (
        f"اكتب مسودة أولى كاملة لوثيقة قانونية من نوع «{body.doc_type}» وفق الممارسة المغربية.\n"
        f"تعليمات المحامي: {body.instructions}{ctx}\n"
        + (f"\nاعتمد على هذا الهيكل/النص الحالي وأكمله:\n{body.base_content}\n" if body.base_content.strip() else "")
        + "\nأعد نص الوثيقة فقط، بدون تعليقات أو تنسيق Markdown، واترك نقاطاً (............) للمعطيات الناقصة."
    )
    return sse_stream(build_chat(LEGAL_SYSTEM, model=body.model), prompt)
