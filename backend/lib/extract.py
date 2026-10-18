"""Text extraction for uploaded files so the assistant can read case documents.

Extracted text is cached on the attachment document (`text` field) after the first read.
"""
import asyncio
import os
from pathlib import Path

from lib.db import db

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
READABLE_EXT = {".pdf", ".docx", ".txt"}


def is_readable(filename: str) -> bool:
    return os.path.splitext(filename or "")[1].lower() in READABLE_EXT


def _extract(path: Path, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        return "\n".join((p.extract_text() or "") for p in reader.pages)
    if ext == ".docx":
        import docx

        d = docx.Document(str(path))
        return "\n".join(p.text for p in d.paragraphs)
    if ext == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore")
    return ""


async def attachment_text(att: dict) -> str:
    if "text" in att:
        return att["text"]
    path = UPLOAD_DIR / att["id"]
    text = ""
    if path.exists() and is_readable(att.get("filename", "")):
        try:
            text = (await asyncio.to_thread(_extract, path, att["filename"])).strip()
        except Exception:  # corrupt / encrypted file: treat as unreadable
            text = ""
    await db.attachments.update_one({"id": att["id"]}, {"$set": {"text": text}})
    return text
