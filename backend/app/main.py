# Влезна точка на FastAPI апликацијата
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .db import Base, engine
from .routers import admin, auth, bookings, content, games, leaderboard, rooms
from .seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # При старт: креирај ги табелите и додај демо податоци ако базата е празна
    Base.metadata.create_all(engine)
    seed_if_empty()
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
    return {"status": "ok"}
