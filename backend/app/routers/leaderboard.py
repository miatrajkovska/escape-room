# /api/leaderboard – најбрзи тимови по соба
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..db import get_db
from ..models import LeaderboardEntry, Room
from ..serializers import leaderboard_out
from .rooms import get_room_or_404

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


def top_entries(db: Session, room_id: int, limit: int) -> list[dict]:
    rows = db.scalars(
        select(LeaderboardEntry)
        .options(joinedload(LeaderboardEntry.room))
        .where(LeaderboardEntry.room_id == room_id)
        .order_by(LeaderboardEntry.time_seconds, LeaderboardEntry.hints_used, LeaderboardEntry.played_on)
        .limit(limit)
    ).all()
    return [leaderboard_out(e, i + 1) for i, e in enumerate(rows)]


@router.get("")
def all_rooms_leaderboard(limit: int = Query(default=10, le=50), db: Session = Depends(get_db)):
    rooms = db.scalars(select(Room).order_by(Room.sort_order)).all()
    return {r.slug: top_entries(db, r.id, limit) for r in rooms}


@router.get("/{slug}")
def room_leaderboard(slug: str, limit: int = Query(default=10, le=50), db: Session = Depends(get_db)):
    room = get_room_or_404(db, slug)
    return top_entries(db, room.id, limit)
