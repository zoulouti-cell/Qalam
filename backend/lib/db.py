"""Shared Mongo handle — import `client`/`db` from here (server.py, routers, seed.py)."""

import logging
import os
from contextvars import ContextVar
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

load_dotenv(Path(__file__).parent.parent / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
raw = client[os.environ["DB_NAME"]]  # unscoped handle: auth, platform admin, crons, migrations

# ---- multi-office isolation ----
# Every office-owned collection is accessed through `db`, which transparently adds the current office_id
# (set by get_current_user / public token lookups) to every filter and inserted document.
current_office: ContextVar[str] = ContextVar("current_office", default="")
TENANT = {
    "clients", "cases", "case_events", "attachments", "appointments", "documents", "invoices", "letterheads", "office",
    "deadlines", "conversations", "templates", "activity", "drive_credentials", "drive_folders", "counters", "reminder_state", "library",
}
SHARED_READ = {"library", "attachments"}  # legal library items with office_id "" are visible to every office (read-only)


def office_id() -> str:
    o = current_office.get()
    if not o:
        raise RuntimeError("office-scoped collection used without an office context")
    return o


class Scoped:
    def __init__(self, coll, shared: bool):
        self._c, self._shared = coll, shared

    @staticmethod
    def _key(v: str) -> str:  # string _id singletons ("office", "invoice"…) become per-office keys
        return f"{office_id()}:{v.rsplit(':', 1)[-1]}"

    def _f(self, flt: dict | None, read: bool = False) -> dict:
        flt = dict(flt or {})
        if isinstance(flt.get("_id"), str):
            flt["_id"] = self._key(flt["_id"])
        cond = {"$in": [office_id(), ""]} if read and self._shared else office_id()
        if "office_id" in flt:
            return {"$and": [flt, {"office_id": cond}]}
        flt["office_id"] = cond
        return flt

    def _d(self, doc: dict) -> dict:
        doc = {**doc, "office_id": office_id()}
        if isinstance(doc.get("_id"), str):
            doc["_id"] = self._key(doc["_id"])
        return doc

    # reads
    def find(self, flt=None, *a, **kw):
        return self._c.find(self._f(flt, True), *a, **kw)

    async def find_one(self, flt=None, *a, **kw):
        return await self._c.find_one(self._f(flt, True), *a, **kw)

    async def count_documents(self, flt=None, *a, **kw):
        return await self._c.count_documents(self._f(flt, True), *a, **kw)

    async def distinct(self, key, flt=None, *a, **kw):
        return await self._c.distinct(key, self._f(flt, True), *a, **kw)

    def aggregate(self, pipeline, *a, **kw):
        return self._c.aggregate([{"$match": self._f({}, True)}, *pipeline], *a, **kw)

    # writes (own office only)
    async def insert_one(self, doc, *a, **kw):
        return await self._c.insert_one(self._d(doc), *a, **kw)

    async def insert_many(self, docs, *a, **kw):
        return await self._c.insert_many([self._d(d) for d in docs], *a, **kw)

    async def update_one(self, flt, upd, *a, **kw):
        return await self._c.update_one(self._f(flt), upd, *a, **kw)

    async def update_many(self, flt, upd, *a, **kw):
        return await self._c.update_many(self._f(flt), upd, *a, **kw)

    async def replace_one(self, flt, doc, *a, **kw):
        return await self._c.replace_one(self._f(flt), self._d(doc), *a, **kw)

    async def delete_one(self, flt, *a, **kw):
        return await self._c.delete_one(self._f(flt), *a, **kw)

    async def delete_many(self, flt, *a, **kw):
        return await self._c.delete_many(self._f(flt), *a, **kw)

    async def find_one_and_update(self, flt, upd, *a, **kw):
        return await self._c.find_one_and_update(self._f(flt), upd, *a, **kw)

    async def find_one_and_delete(self, flt, *a, **kw):
        return await self._c.find_one_and_delete(self._f(flt), *a, **kw)


class TenantDB:
    def __getattr__(self, name: str):
        return Scoped(raw[name], name in SHARED_READ) if name in TENANT else raw[name]

    __getitem__ = __getattr__


db = TenantDB()

logger = logging.getLogger(__name__)

# One entry per collection: every field a route filters, sorts, or dedupes on. Applied by ensure_indexes() at startup.
INDEXES: dict[str, list[IndexModel]] = {
    "users": [IndexModel([("user_id", ASCENDING)], name="user_id", unique=True), IndexModel([("email", ASCENDING)], name="email", unique=True)],
    "user_sessions": [IndexModel([("session_token", ASCENDING)], name="token"), IndexModel([("user_id", ASCENDING)], name="user")],
    "clients": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("name", ASCENDING)], name="name")],
    "cases": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("client_id", ASCENDING)], name="client"),
        IndexModel([("status", ASCENDING), ("created_at", DESCENDING)], name="status_created"),
    ],
    "case_events": [IndexModel([("case_id", ASCENDING), ("date", DESCENDING)], name="case_date")],
    "attachments": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("owner_type", ASCENDING), ("owner_id", ASCENDING)], name="owner")],
    "appointments": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("date", ASCENDING), ("time", ASCENDING)], name="date_time")],
    "documents": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("case_id", ASCENDING), ("updated_at", DESCENDING)], name="case_updated")],
    "library": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("section", ASCENDING), ("domain", ASCENDING)], name="section_domain")],
    "conversations": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("user_id", ASCENDING), ("updated_at", DESCENDING)], name="user_updated")],
    "activity": [IndexModel([("office_id", ASCENDING), ("created_at", DESCENDING)], name="office_created")],
    "offices": [IndexModel([("id", ASCENDING)], name="id", unique=True), IndexModel([("invite_code", ASCENDING)], name="invite_code")],
}
for _name in TENANT:  # every office-scoped query filters on office_id first
    INDEXES.setdefault(_name, []).append(IndexModel([("office_id", ASCENDING)], name="office_id"))


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await raw[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)
