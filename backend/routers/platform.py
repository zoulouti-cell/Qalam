"""Platform admin (PLATFORM_ADMIN_EMAILS): list every registered office and suspend / reactivate it."""
from fastapi import APIRouter, Depends, HTTPException

from lib.auth import require_platform_admin
from lib.db import raw
from models.schemas import OfficeActive, OfficeSummary, User

router = APIRouter()


async def summary(o: dict) -> OfficeSummary:
    oid = o["id"]
    return OfficeSummary(
        **{k: o.get(k) for k in ("id", "name", "owner_email", "created_at") if o.get(k) is not None}, active=o.get("active", True),
        users=await raw.users.count_documents({"office_id": oid}), cases=await raw.cases.count_documents({"office_id": oid}),
        clients=await raw.clients.count_documents({"office_id": oid}),
    )


@router.get("/platform/offices", response_model=list[OfficeSummary])
async def list_offices(_: User = Depends(require_platform_admin)):
    return [await summary(o) for o in await raw.offices.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)]


@router.patch("/platform/offices/{id}", response_model=OfficeSummary)
async def set_active(id: str, body: OfficeActive, user: User = Depends(require_platform_admin)):
    if id == user.office_id and not body.active:
        raise HTTPException(status_code=400, detail="cannot suspend your own office")
    o = await raw.offices.find_one_and_update({"id": id}, {"$set": {"active": body.active}}, projection={"_id": 0}, return_document=True)
    if not o:
        raise HTTPException(status_code=404, detail="not found")
    if not body.active:
        uids = [u["user_id"] async for u in raw.users.find({"office_id": id}, {"user_id": 1})]
        await raw.user_sessions.delete_many({"user_id": {"$in": uids}})  # sign the suspended office out
    return await summary(o)
