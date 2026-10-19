from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request

from lib.db import current_office, db, raw
from lib.offices import platform_admins
from models.schemas import Activity, User


async def get_current_user(request: Request) -> User:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await raw.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user = await raw.users.find_one({"user_id": session["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user or not user.get("office_id"):
        raise HTTPException(status_code=401, detail="User removed")
    u = User(**user)
    u.is_platform_admin = u.email.lower() in platform_admins()
    office = await raw.offices.find_one({"id": u.office_id}, {"_id": 0, "name": 1, "active": 1}) or {}
    if not office.get("active", True) and not u.is_platform_admin:
        raise HTTPException(status_code=403, detail="office_suspended")
    u.office_name = office.get("name", "")
    current_office.set(u.office_id)  # every office-scoped query in this request is filtered to this office
    return u


async def require_platform_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_platform_admin:
        raise HTTPException(status_code=403, detail="Platform admin only")
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


async def log_activity(user: User, action: str, label: str) -> None:
    await db.activity.insert_one(Activity(user_name=user.name or user.email, action=action, label=label).model_dump())
