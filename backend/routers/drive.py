import asyncio
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow

from lib import drive
from lib.auth import require_admin
from lib.db import db
from models.schemas import DriveStatus, User, now_iso

router = APIRouter()


def public_base(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", request.url.netloc)
    return f"{proto}://{host}"


@router.get("/drive/status", response_model=DriveStatus)
async def status(_: User = Depends(require_admin)):
    d = await drive.creds_doc()
    synced, pending = await drive.counts() if d else (0, 0)
    root = (d or {}).get("root_folder_id")
    return DriveStatus(
        configured=drive.configured(),
        connected=bool(d),
        email=(d or {}).get("email", ""),
        folder_url=f"https://drive.google.com/drive/folders/{root}" if root else "",
        synced=synced,
        pending=pending,
        last_error=(d or {}).get("last_error", ""),
    )


@router.get("/drive/connect")
async def connect(request: Request, user: User = Depends(require_admin)):
    if not drive.configured():
        raise HTTPException(status_code=400, detail="Google Drive is not configured on the server")
    redirect_uri = f"{public_base(request)}/api/drive/callback"
    flow = Flow.from_client_config(drive.client_config(redirect_uri), scopes=drive.SCOPES + ["openid", "https://www.googleapis.com/auth/userinfo.email"], redirect_uri=redirect_uri)
    state = secrets.token_urlsafe(24)
    url, _ = flow.authorization_url(access_type="offline", include_granted_scopes="true", prompt="consent", state=state)
    await db.drive_oauth_state.insert_one({"state": state, "user_id": user.user_id, "redirect_uri": redirect_uri, "code_verifier": flow.code_verifier, "created_at": now_iso()})
    return {"authorization_url": url}


@router.get("/drive/callback")
async def callback(request: Request, code: str = "", state: str = "", error: str = ""):
    base = public_base(request)
    st = await db.drive_oauth_state.find_one_and_delete({"state": state}) if state else None
    if error or not st or not code:
        return RedirectResponse(f"{base}/settings?drive=error")
    flow = Flow.from_client_config(drive.client_config(st["redirect_uri"]), scopes=None, redirect_uri=st["redirect_uri"])
    if st.get("code_verifier"):
        flow.code_verifier = st["code_verifier"]
    try:
        await asyncio.to_thread(flow.fetch_token, code=code)
    except Exception:
        return RedirectResponse(f"{base}/settings?drive=error")
    c = flow.credentials
    if not set(drive.SCOPES).issubset(set(c.scopes or [])):
        return RedirectResponse(f"{base}/settings?drive=scope")
    email = ""
    try:
        import httpx

        async with httpx.AsyncClient(timeout=10) as http:
            r = await http.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={"Authorization": f"Bearer {c.token}"})
            email = r.json().get("email", "")
    except Exception:
        pass
    await db.drive_credentials.update_one(
        {"_id": drive.CRED_ID},
        {"$set": {
            "access_token": c.token, "refresh_token": c.refresh_token, "scopes": list(c.scopes or []), "email": email,
            "expiry": c.expiry.isoformat() + "+00:00" if c.expiry else None, "connected_at": now_iso(), "last_error": "",
        }},
        upsert=True,
    )
    asyncio.create_task(drive.sync_all())
    return RedirectResponse(f"{base}/settings?drive=connected")


@router.post("/drive/sync")
async def sync(_: User = Depends(require_admin)):
    if not await drive.creds_doc():
        raise HTTPException(status_code=400, detail="Drive not connected")
    asyncio.create_task(drive.sync_all())
    return {"ok": True}


@router.delete("/drive")
async def disconnect(_: User = Depends(require_admin)):
    d = await drive.creds_doc()
    if d and d.get("access_token"):
        try:
            import httpx

            async with httpx.AsyncClient(timeout=10) as http:
                await http.post("https://oauth2.googleapis.com/revoke", params={"token": d.get("refresh_token") or d["access_token"]})
        except Exception:
            pass
    await db.drive_credentials.delete_one({"_id": drive.CRED_ID})
    await db.drive_folders.delete_many({})
    await db.attachments.update_many({}, {"$unset": {"drive_file_id": ""}})
    await db.documents.update_many({}, {"$unset": {"drive_file_id": "", "drive_synced_at": ""}})
    return {"ok": True}
