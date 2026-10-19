import uuid
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib.auth import get_current_user, require_admin
from lib.db import raw as db
from lib.offices import ensure_active, new_code, new_user_doc
from models.schemas import InviteCode, SessionIn, TeamInvite, TeamRoleUpdate, User

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
        await ensure_active(existing)
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": existing.get("name") or data.get("name", ""), "picture": data.get("picture", ""), "active": True}},
        )
        user_id = existing["user_id"]
    else:
        # New account: creates its own independent office (admin), or joins one with an invite code.
        doc = await new_user_doc(email, data.get("name", ""), data.get("picture", ""), body.invite_code, body.office_name)
        user_id = doc["user_id"]
        await db.users.insert_one(doc)

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


@router.get("/team/invite-code", response_model=InviteCode)
async def get_invite_code(user: User = Depends(require_admin)):
    o = await db.offices.find_one({"id": user.office_id}, {"_id": 0, "invite_code": 1}) or {}
    return InviteCode(code=o.get("invite_code", ""))


@router.post("/team/invite-code", response_model=InviteCode)
async def rotate_invite_code(user: User = Depends(require_admin)):
    code = new_code()
    await db.offices.update_one({"id": user.office_id}, {"$set": {"invite_code": code}})
    return InviteCode(code=code)


@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"ok": True}


# ---- team (list visible to all members so cases can be assigned; edits admin-only) ----
@router.get("/team", response_model=list[User])
async def list_team(me: User = Depends(get_current_user)):
    docs = await db.users.find({"office_id": me.office_id}, {"_id": 0, "password_hash": 0}).sort("created_at", 1).to_list(500)
    return [User(**d) for d in docs]


@router.post("/team", response_model=User)
async def invite(body: TeamInvite, admin: User = Depends(require_admin)):
    email = body.email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=422, detail="invalid email")
    existing = await db.users.find_one({"email": email}, {"office_id": 1})
    if existing:
        raise HTTPException(status_code=409, detail="already a member" if existing.get("office_id") == admin.office_id else "email_in_other_office")
    user = User(user_id=f"user_{uuid.uuid4().hex[:12]}", email=email, name=body.name, role=body.role, office_id=admin.office_id)
    await db.users.insert_one(user.model_dump())
    return user


@router.patch("/team/{user_id}", response_model=User)
async def update_role(user_id: str, body: TeamRoleUpdate, admin: User = Depends(require_admin)):
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="cannot change own role")
    res = await db.users.find_one_and_update({"user_id": user_id, "office_id": admin.office_id}, {"$set": {"role": body.role}}, projection={"_id": 0, "password_hash": 0}, return_document=True)
    if not res:
        raise HTTPException(status_code=404, detail="not found")
    return User(**res)


@router.delete("/team/{user_id}")
async def remove_member(user_id: str, admin: User = Depends(require_admin)):
    if user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="cannot remove yourself")
    res = await db.users.delete_one({"user_id": user_id, "office_id": admin.office_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    await db.user_sessions.delete_many({"user_id": user_id})
    return {"ok": True}


# ---- email & password sign-in (same rules as Google: new office, invite code, or pre-invited email) ----
import hashlib  # noqa: E402
import secrets  # noqa: E402

import bcrypt  # noqa: E402

from lib import email as mail  # noqa: E402
from models.schemas import ForgotIn, PasswordLogin, PasswordRegister, ResetIn  # noqa: E402

MAX_FAILS = 5
LOCK_MINUTES = 15
RESET_TTL = timedelta(hours=1)


def _norm(email: str) -> str:
    return email.strip().lower()


async def _issue_session(response: Response, user_id: str) -> User:
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    await db.user_sessions.insert_one({"user_id": user_id, "session_token": token, "expires_at": now + timedelta(days=7), "created_at": now})
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", path="/", max_age=7 * 24 * 3600)
    await db.users.update_one({"user_id": user_id}, {"$set": {"active": True}})
    return User(**await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0}))


@router.post("/auth/register", response_model=User)
async def register(body: PasswordRegister, response: Response):
    """Set a password for an invited email, or create a new account (own office, or join one with an invite code)."""
    email = _norm(body.email)
    if "@" not in email:
        raise HTTPException(status_code=422, detail="invalid email")
    existing = await db.users.find_one({"email": email})
    if existing:
        if existing.get("password_hash"):
            raise HTTPException(status_code=409, detail="password_already_set")
        user_id = existing["user_id"]
        update = {"password_hash": bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()}
        if body.name and not existing.get("name"):
            update["name"] = body.name
        await db.users.update_one({"user_id": user_id}, {"$set": update})
    else:
        doc = await new_user_doc(email, body.name, "", body.invite_code, body.office_name)
        user_id = doc["user_id"]
        await db.users.insert_one({**doc, "password_hash": bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()})
    return await _issue_session(response, user_id)


@router.post("/auth/login", response_model=User)
async def password_login(body: PasswordLogin, response: Response):
    email = _norm(body.email)
    now = datetime.now(timezone.utc)
    att = await db.login_attempts.find_one({"email": email}) or {}
    locked = att.get("locked_until")
    if locked and (locked.replace(tzinfo=timezone.utc) if locked.tzinfo is None else locked) > now:
        raise HTTPException(status_code=429, detail="too_many_attempts")
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        fails = att.get("fails", 0) + 1
        upd = {"fails": fails, **({"locked_until": now + timedelta(minutes=LOCK_MINUTES), "fails": 0} if fails >= MAX_FAILS else {})}
        await db.login_attempts.update_one({"email": email}, {"$set": upd}, upsert=True)
        raise HTTPException(status_code=401, detail="invalid_credentials")
    await db.login_attempts.delete_one({"email": email})
    await ensure_active(user)
    return await _issue_session(response, user["user_id"])


@router.post("/auth/forgot-password")
async def forgot_password(body: ForgotIn, request: Request):
    """Always answers ok (no account enumeration); emails a 1-hour reset link to team members."""
    email = _norm(body.email)
    user = await db.users.find_one({"email": email}, {"_id": 0, "user_id": 1, "name": 1})
    if user and mail.configured():
        token = secrets.token_urlsafe(32)
        await db.password_resets.insert_one({
            "token_hash": hashlib.sha256(token.encode()).hexdigest(), "user_id": user["user_id"],
            "expires_at": datetime.now(timezone.utc) + RESET_TTL, "used": False,
        })
        proto = request.headers.get("x-forwarded-proto", request.url.scheme)
        host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
        link = f"{proto}://{host}/reset-password?token={token}"
        html = (
            '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;color:#0B1F18;max-width:560px;margin:auto;padding:24px">'
            '<h2 style="color:#0E3B2B">قلم — إعادة تعيين كلمة المرور</h2>'
            "<p>طلبتَ إعادة تعيين كلمة المرور لحسابك. الرابط صالح لمدة ساعة واحدة:</p>"
            f'<p><a href="{link}" style="background:#0F5132;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">تعيين كلمة مرور جديدة</a></p>'
            '<p style="font-size:12px;color:#78716c">إن لم تطلب ذلك فتجاهل هذه الرسالة؛ كلمة مرورك الحالية تبقى كما هي.</p></div>'
        )
        try:
            await mail.send_email(to=email, subject="قلم — إعادة تعيين كلمة المرور", html=html)
        except Exception:
            pass
    return {"ok": True}


@router.post("/auth/reset-password")
async def reset_password(body: ResetIn):
    rec = await db.password_resets.find_one({"token_hash": hashlib.sha256(body.token.encode()).hexdigest(), "used": False})
    exp = rec and rec["expires_at"]
    if not rec or (exp.replace(tzinfo=timezone.utc) if exp.tzinfo is None else exp) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="invalid_or_expired")
    await db.users.update_one({"user_id": rec["user_id"]}, {"$set": {"password_hash": bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()}})
    await db.password_resets.update_one({"_id": rec["_id"]}, {"$set": {"used": True}})
    await db.user_sessions.delete_many({"user_id": rec["user_id"]})  # sign out everywhere
    return {"ok": True}
