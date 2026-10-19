"""Text extraction for uploaded files so the assistant (and library search) can read them.

Text PDFs / Word / txt are parsed locally; images and scanned PDFs go through OCR with
Gemini (Emergent universal key). The result is cached on the attachment (`text`).
"""
import asyncio
import logging
import os
import uuid
from pathlib import Path

from emergentintegrations.llm.chat import FileContentWithMimeType, LlmChat, StreamDone, TextDelta, UserMessage

from lib.db import db

log = logging.getLogger(__name__)
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
TEXT_EXT = {".pdf", ".docx", ".txt"}
IMAGE_MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
READABLE_EXT = TEXT_EXT | set(IMAGE_MIME)
OCR_MODEL = ("gemini", "gemini-3-flash-preview")
MIN_CHARS_PER_PAGE = 40  # below this a PDF is treated as scanned


def is_readable(filename: str) -> bool:
    return os.path.splitext(filename or "")[1].lower() in READABLE_EXT


def _extract(path: Path, ext: str) -> tuple[str, int]:
    """Returns (text, pages)."""
    if ext == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        return "\n".join((p.extract_text() or "") for p in reader.pages), len(reader.pages)
    if ext == ".docx":
        import docx

        return "\n".join(p.text for p in docx.Document(str(path)).paragraphs), 1
    if ext == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore"), 1
    return "", 1


async def ocr(path: Path, mime: str) -> str:
    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=str(uuid.uuid4()),
        system_message="You are a precise OCR engine for Moroccan legal documents (Arabic and French).",
    ).with_model(*OCR_MODEL)
    msg = UserMessage(
        text=(
            "استخرج النص الكامل لهذه الوثيقة كما هو حرفياً، صفحةً صفحة، مع الحفاظ على ترتيب الفقرات واللغة الأصلية "
            "(العربية أو الفرنسية). لا تلخص ولا تعلق، وأعد النص فقط."
        ),
        file_contents=[FileContentWithMimeType(file_path=str(path), mime_type=mime)],
    )
    out = ""
    async for ev in chat.stream_message(msg):
        if isinstance(ev, TextDelta):
            out += ev.content
        elif isinstance(ev, StreamDone):
            break
    return out.strip()


async def attachment_text(att: dict) -> str:
    if "text" in att:
        return att["text"]
    path = UPLOAD_DIR / att["id"]
    ext = os.path.splitext(att.get("filename", ""))[1].lower()
    text = ""
    if path.exists() and ext in READABLE_EXT:
        try:
            if ext in IMAGE_MIME:
                text = await ocr(path, IMAGE_MIME[ext])
            else:
                text, pages = await asyncio.to_thread(_extract, path, ext)
                text = text.strip()
                if ext == ".pdf" and len(text) < MIN_CHARS_PER_PAGE * pages:
                    text = await ocr(path, "application/pdf") or text
        except Exception as exc:  # corrupt / encrypted / OCR failure: treat as unreadable
            log.warning("extract failed for %s: %s", att.get("id"), exc)
            text = ""
    await db.attachments.update_one({"id": att["id"]}, {"$set": {"text": text}})
    return text
