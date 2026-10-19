"""Office registry (global): each office is an independent tenant; users belong to exactly one office."""
import os
import secrets
import uuid

from fastapi import HTTPException

from lib.db import raw
from models.schemas import now_iso


def platform_admins() -> set[str]:
    return {e.strip().lower() for e in os.environ.get("PLATFORM_ADMIN_EMAILS", "").split(",") if e.strip()}


def new_code() -> str:
    return secrets.token_hex(4).upper()  # e.g. 9F3A1C07


async def create_office(name: str, owner_email: str) -> str:
    oid = uuid.uuid4().hex
    await raw.offices.insert_one({"id": oid, "name": name.strip()[:120] or "مكتب محاماة", "owner_email": owner_email, "active": True,
                                  "invite_code": new_code(), "created_at": now_iso()})
    # office settings singleton (name shown on letterheads / portal)
    await raw.office.update_one({"_id": f"{oid}:office"}, {"$set": {"name": name.strip()[:120], "office_id": oid}}, upsert=True)
    return oid


async def office_by_code(code: str) -> dict:
    o = await raw.offices.find_one({"invite_code": code.strip().upper()}, {"_id": 0}) if code.strip() else None
    if not o:
        raise HTTPException(status_code=404, detail="invalid_invite_code")
    if not o.get("active", True):
        raise HTTPException(status_code=403, detail="office_suspended")
    return o


async def new_user_doc(email: str, name: str, picture: str, invite_code: str, office_name: str) -> dict:
    """A brand-new account: joins the office of the invite code (member) or creates its own office (admin)."""
    if invite_code.strip():
        o = await office_by_code(invite_code)
        office_id, role = o["id"], "member"
    else:
        office_id, role = await create_office(office_name or (f"مكتب الأستاذ(ة) {name}" if name else "مكتب محاماة"), email), "admin"
    return {"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email, "name": name, "picture": picture, "role": role, "active": True,
            "office_id": office_id, "created_at": now_iso()}


async def ensure_active(user_doc: dict) -> None:
    """Members of a suspended office cannot sign in (the platform admin always can)."""
    o = await raw.offices.find_one({"id": user_doc.get("office_id", "")}, {"_id": 0, "active": 1}) or {}
    if o.get("active", True) is False and user_doc.get("email", "").lower() not in platform_admins():
        raise HTTPException(status_code=403, detail="office_suspended")
