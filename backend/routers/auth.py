import uuid
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib.auth import get_current_user, require_admin
from lib.db import db
from models.schemas import SessionIn, TeamInvite, TeamRoleUpdate, User

router = APIRouter()

SESSION_DATA_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


@router.post("/auth/session", response_model=User)
async def create_session(body: SessionIn, response: Response):
    async with httpx.AsyncClient(timeout=20) as http:
        r = await http.get(SESSION_DATA_URL, headers={"X-Session-ID": body.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session id")
    data = r.json()
    email = data["email"].strip().lower()

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": existing.get("name") or data.get("name", ""), "picture": data.get("picture", ""), "active": True}},
        )
        user_id = existing["user_id"]
    else:
        # Only the very first account becomes admin; everyone else must be invited.
        # Seeded test accounts (is_test) don't count, so the real owner still becomes admin.
        if await db.users.count_documents({"is_test": {"$ne": True}}) > 0:
            raise HTTPException(status_code=403, detail="not_invited")
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one(
            User(user_id=user_id, email=email, name=data.get("name", ""), picture=data.get("picture", ""), role="admin", active=True).model_dump()
        )

    token = data["session_token"]
    await db.user_sessions.insert_one(
        {"user_id": user_id, "session_token": token, "expires_at": datetime.now(timezone.utc) + timedelta(days=7), "created_at": datetime.now(timezone.utc)}
    )
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", path="/", max_age=7 * 24 * 3600)
    doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return User(**doc)


@router.get("/auth/me", response_model=User)
async def me(user: User = Depends(get_current_user)):
    return user


@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"ok": True}


# ---- team (list visible to all members so cases can be assigned; edits admin-only) ----
@router.get("/team", response_model=list[User])
async def list_team(_: User = Depends(get_current_user)):
    docs = await db.users.find({}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return [User(**d) for d in docs]


@router.post("/team", response_model=User)
async def invite(body: TeamInvite, _: User = Depends(require_admin)):
    email = body.email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=422, detail="invalid email")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="already a member")
    user = User(user_id=f"user_{uuid.uuid4().hex[:12]}", email=email, name=body.name, role=body.role)
    await db.users.insert_one(user.model_dump())
    return user


@router.patch("/team/{user_id}", response_model=User)
async def update_role(user_id: str, body: TeamRoleUpdate, admin: User = Depends(require_admin)):
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="cannot change own role")
    res = await db.users.find_one_and_update({"user_id": user_id}, {"$set": {"role": body.role}}, projection={"_id": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="not found")
    return User(**res)


@router.delete("/team/{user_id}")
async def remove_member(user_id: str, admin: User = Depends(require_admin)):
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="cannot remove yourself")
    res = await db.users.delete_one({"user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    await db.user_sessions.delete_many({"user_id": user_id})
    return {"ok": True}
