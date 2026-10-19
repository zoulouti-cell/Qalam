"""Emergent object storage for every uploaded file (attachments, letterhead images, logos).

Object storage is the source of truth; backend/uploads/ is only a local cache (so OCR/parsers
can work on a file path). Files are always served through the backend (auth-checked).
"""
import logging
import os
from pathlib import Path

import httpx

log = logging.getLogger(__name__)
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "qalam"
CACHE_DIR = Path(__file__).parent.parent / "uploads"
CACHE_DIR.mkdir(exist_ok=True)
_key: str | None = None


def object_path(att_id: str) -> str:
    return f"{APP_NAME}/files/{att_id}"


async def init_storage(force: bool = False) -> str:
    global _key
    if _key and not force:
        return _key
    async with httpx.AsyncClient(timeout=30) as http:
        r = await http.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")})
    r.raise_for_status()
    _key = r.json()["storage_key"]
    return _key


async def _request(method: str, path: str, **kw) -> httpx.Response:
    for attempt in (0, 1):
        key = await init_storage(force=attempt == 1)
        headers = {"X-Storage-Key": key, **kw.pop("headers", {})}
        async with httpx.AsyncClient(timeout=120) as http:
            r = await http.request(method, f"{STORAGE_URL}/objects/{path}", headers=headers, **kw)
        if r.status_code == 404 and attempt == 0 and method == "PUT":
            continue  # stale storage key → re-init once
        return r
    return r


async def put(att_id: str, data: bytes, content_type: str) -> str:
    """Upload to object storage (and the local cache). Returns the canonical storage path."""
    (CACHE_DIR / att_id).write_bytes(data)
    r = await _request("PUT", object_path(att_id), headers={"Content-Type": content_type or "application/octet-stream"}, content=data)
    r.raise_for_status()
    return r.json().get("path", object_path(att_id))


async def read(att_id: str, storage_path: str = "") -> bytes | None:
    local = CACHE_DIR / att_id
    if local.exists():
        return local.read_bytes()
    r = await _request("GET", storage_path or object_path(att_id))
    if r.status_code != 200:
        if r.status_code == 404:
            r = await _request("GET", storage_path or object_path(att_id))  # retry after re-init
        if r.status_code != 200:
            return None
    local.write_bytes(r.content)
    return r.content


async def local_path(att_id: str, storage_path: str = "") -> Path | None:
    """Local file for parsers / FileResponse, pulled from object storage when not cached."""
    return CACHE_DIR / att_id if await read(att_id, storage_path) is not None else None


def drop_cache(att_id: str) -> None:
    """Storage has no delete API: the DB record is removed and only the local copy is cleared."""
    (CACHE_DIR / att_id).unlink(missing_ok=True)
