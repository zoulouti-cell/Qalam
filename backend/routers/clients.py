from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_user, log_activity
from lib.db import db
from models.schemas import Case, Client, ClientIn, User

router = APIRouter()


@router.get("/clients", response_model=list[Client])
async def list_clients(q: str = "", _: User = Depends(get_current_user)):
    flt = {}
    if q:
        rx = {"$regex": q, "$options": "i"}
        flt = {"$or": [{"name": rx}, {"phone": rx}, {"email": rx}, {"id_number": rx}]}
    docs = await db.clients.find(flt, {"_id": 0}).sort("name", 1).to_list(2000)
    counts = {c["_id"]: c["n"] async for c in db.cases.aggregate([{"$group": {"_id": "$client_id", "n": {"$sum": 1}}}])}
    return [Client(**{**d, "case_count": counts.get(d["id"], 0)}) for d in docs]


@router.post("/clients", response_model=Client)
async def create_client(body: ClientIn, user: User = Depends(get_current_user)):
    c = Client(**body.model_dump())
    await db.clients.insert_one(c.model_dump())
    await log_activity(user, "client.create", c.name)
    return c


@router.get("/clients/{id}", response_model=Client)
async def get_client(id: str, _: User = Depends(get_current_user)):
    d = await db.clients.find_one({"id": id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    d["case_count"] = await db.cases.count_documents({"client_id": id})
    return Client(**d)


@router.put("/clients/{id}", response_model=Client)
async def update_client(id: str, body: ClientIn, user: User = Depends(get_current_user)):
    d = await db.clients.find_one_and_update({"id": id}, {"$set": body.model_dump()}, projection={"_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    await log_activity(user, "client.update", body.name)
    return Client(**d)


@router.delete("/clients/{id}")
async def delete_client(id: str, user: User = Depends(get_current_user)):
    d = await db.clients.find_one_and_delete({"id": id})
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    await log_activity(user, "client.delete", d["name"])
    return {"ok": True}


@router.get("/clients/{id}/cases", response_model=list[Case])
async def client_cases(id: str, _: User = Depends(get_current_user)):
    docs = await db.cases.find({"client_id": id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Case(**d) for d in docs]
