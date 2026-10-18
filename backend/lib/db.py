"""Shared Mongo handle — import `client`/`db` from here (server.py, routers, seed.py)."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

load_dotenv(Path(__file__).parent.parent / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

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
    "activity": [IndexModel([("created_at", DESCENDING)], name="created_desc")],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)
