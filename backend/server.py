import asyncio
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from lib.db import TENANT, client, ensure_indexes, raw  # noqa: E402
from routers import agenda, appointments, assistant, auth, cases, clients, dashboard, deadlines, documents, drive, letterheads, invoices, library, office, platform, portal, reminders, speech  # noqa: E402


async def migrate_local_files() -> None:
    """Init object storage once and push any file that only exists in the local cache."""
    from lib import storage

    db = raw
    try:
        await storage.init_storage()
        async for a in db.attachments.find({"storage_path": {"$exists": False}}, {"_id": 0, "id": 1, "content_type": 1}):
            p = storage.CACHE_DIR / a["id"]
            if p.exists():
                path = await storage.put(a["id"], p.read_bytes(), a.get("content_type", ""))
                await db.attachments.update_one({"id": a["id"]}, {"$set": {"storage_path": path}})
    except Exception as exc:  # never block startup
        logging.getLogger(__name__).error("object storage init/migration failed: %s", exc)


async def migrate_multi_office() -> None:
    """One-time switch to independent offices. As requested by the owner, the previous single-office data is
    wiped so every office starts from zero. Guarded by a marker document: never runs twice."""
    if await raw.migrations.find_one({"_id": "multi_office_v1"}):
        return
    for name in sorted(TENANT | {"users", "user_sessions", "password_resets", "login_attempts", "drive_oauth_state", "offices"}):
        await raw[name].delete_many({})
    await raw.migrations.insert_one({"_id": "multi_office_v1"})
    logging.getLogger(__name__).warning("multi-office migration: previous single-office data cleared")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await migrate_multi_office()
    app.state.index_task = asyncio.create_task(ensure_indexes())
    app.state.storage_task = asyncio.create_task(migrate_local_files())
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Qalam API"}


for r in (auth, clients, cases, appointments, documents, letterheads, library, assistant, dashboard, agenda, office, drive, deadlines, reminders, speech, invoices, portal, platform):
    api_router.include_router(r.router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Include the router in the main app — keep last
app.include_router(api_router)
