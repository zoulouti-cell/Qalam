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

from lib.db import client, ensure_indexes  # noqa: E402
from routers import agenda, appointments, assistant, auth, cases, clients, dashboard, deadlines, documents, drive, letterheads, invoices, library, office, reminders, speech  # noqa: E402


async def migrate_local_files() -> None:
    """Init object storage once and push any file that only exists in the local cache."""
    from lib import storage
    from lib.db import db

    try:
        await storage.init_storage()
        async for a in db.attachments.find({"storage_path": {"$exists": False}}, {"_id": 0, "id": 1, "content_type": 1}):
            p = storage.CACHE_DIR / a["id"]
            if p.exists():
                path = await storage.put(a["id"], p.read_bytes(), a.get("content_type", ""))
                await db.attachments.update_one({"id": a["id"]}, {"$set": {"storage_path": path}})
    except Exception as exc:  # never block startup
        logging.getLogger(__name__).error("object storage init/migration failed: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    app.state.storage_task = asyncio.create_task(migrate_local_files())
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Qalam API"}


for r in (auth, clients, cases, appointments, documents, letterheads, library, assistant, dashboard, agenda, office, drive, deadlines, reminders, speech, invoices):
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
