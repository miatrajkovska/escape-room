# Влезна точка на FastAPI апликацијата
import logging
import os
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import make_url, text

from .config import CORS_ORIGINS, DATABASE_URL
from .db import ENGINE_ERROR, Base, engine
from .routers import admin, auth, bookings, content, games, leaderboard, rooms
from .seed import seed_if_empty

log = logging.getLogger("uvicorn.error")

# Грешката при старт (ако има), за да ја покаже /api/health
STARTUP_ERROR: str | None = None


def database_host() -> str | None:
    # Само hostname од DATABASE_URL (без корисник и лозинка)
    try:
        return make_url(DATABASE_URL).host
    except Exception:
        return None


def safe_error(e: Exception) -> str:
    # Тип + порака на грешката, без лозинка и без целиот DATABASE_URL
    msg = str(e)
    if DATABASE_URL:
        msg = msg.replace(DATABASE_URL, "***")
    msg = re.sub(r"://[^@/\s]+@", "://***@", msg)  # user:password@ во било кој URL
    msg = re.sub(r"(password\s*=\s*)\S+", r"\g<1>***", msg, flags=re.I)  # password=... во пораката
    msg = re.sub(r"user '[^']*'", "user '***'", msg)  # корисничко име на базата
    return f"{type(e).__name__}: {msg[:500]}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    global STARTUP_ERROR
    # При старт: креирај ги табелите и додај демо податоци ако базата е празна.
    # Ако базата не работи, НЕ паѓаме – ја логираме грешката и апликацијата продолжува.
    try:
        Base.metadata.create_all(engine)
        # create_all не додава колони во постоечка табела, па новата колона ја додаваме рачно
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(40) NOT NULL DEFAULT ''"))
        seed_if_empty()
    except Exception as e:
        STARTUP_ERROR = ENGINE_ERROR or safe_error(e)
        log.error("Database setup failed at startup: %s", STARTUP_ERROR)
    yield


app = FastAPI(title="Press Esc API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # и preview верзиите на Vercel
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, rooms, bookings, leaderboard, games, content, admin):
    app.include_router(r.router)


@app.get("/")
def root():
    return {"name": "Press Esc API", "docs": "/docs"}


@app.get("/api/health")
def health():
    # Секогаш 200, за да се гледа грешката; "database" кажува дали базата работи
    result = {
        "status": "ok",
        "database": "ok",
        # Дали променливата постои (и не е празна) во контејнерот
        "database_url_set": bool(os.environ.get("DATABASE_URL")),
        "database_host": database_host(),
    }
    try:
        if ENGINE_ERROR:
            raise RuntimeError(ENGINE_ERROR)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        result["status"] = "degraded"
        result["database"] = "error"
        result["error"] = ENGINE_ERROR or safe_error(e)
    if STARTUP_ERROR:
        result["startup_error"] = STARTUP_ERROR
    return result
