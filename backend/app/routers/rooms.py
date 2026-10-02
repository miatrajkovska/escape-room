# /api/rooms – собите, слободни термини, календар
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Booking, LeaderboardEntry, Room
from ..pricing import BOOKING_WINDOW_DAYS, PRICE_TABLE, SLOT_TIMES, WEEKEND_SURCHARGE, is_slot_in_past, local_now
from ..serializers import room_out

router = APIRouter(prefix="/api", tags=["rooms"])


def get_room_or_404(db: Session, slug: str) -> Room:
    room = db.scalar(select(Room).where(Room.slug == slug))
    if not room:
        raise HTTPException(404, "Room not found")
    return room


def best_times(db: Session) -> dict[int, int]:
    rows = db.execute(
        select(LeaderboardEntry.room_id, func.min(LeaderboardEntry.time_seconds)).group_by(LeaderboardEntry.room_id)
    ).all()
    return {room_id: t for room_id, t in rows}


# Собите ретко се менуваат, па листата ја чуваме во меморија.
# Така /api/rooms не оди до базата (која е далеку) при секое барање.
_rooms_cache: list[dict] | None = None


def clear_rooms_cache():
    # Се повикува кога админ ќе смени соба или рекорд
    global _rooms_cache
    _rooms_cache = None


@router.get("/rooms")
def list_rooms(db: Session = Depends(get_db)):
    global _rooms_cache
    if _rooms_cache is None:
        rooms = db.scalars(select(Room).order_by(Room.sort_order)).all()
        best = best_times(db)
        _rooms_cache = [room_out(r, best.get(r.id)) for r in rooms]
    return _rooms_cache


@router.get("/rooms/{slug}")
def get_room(slug: str, db: Session = Depends(get_db)):
    room = next((r for r in list_rooms(db) if r["slug"] == slug), None)
    if not room:
        raise HTTPException(404, "Room not found")
    return room


def taken_times(db: Session, room_id: int, day: date) -> set[str]:
    rows = db.scalars(
        select(Booking.time).where(Booking.room_id == room_id, Booking.date == day, Booking.status != "cancelled")
    ).all()
    return set(rows)


@router.get("/rooms/{slug}/availability")
def availability(slug: str, day: date = Query(alias="date"), db: Session = Depends(get_db)):
    # Кои термини се слободни за избраниот ден
    room = get_room_or_404(db, slug)
    taken = taken_times(db, room.id, day)
    today = local_now().date()
    too_far = day > today + timedelta(days=BOOKING_WINDOW_DAYS)
    slots = [
        {"time": t, "available": not (t in taken or is_slot_in_past(day, t) or too_far)}
        for t in SLOT_TIMES
    ]
    return {"date": day.isoformat(), "slots": slots}


@router.get("/rooms/{slug}/calendar")
def calendar(slug: str, start: date, days: int = Query(default=42, le=90), db: Session = Depends(get_db)):
    # Број на слободни термини по ден (за точки во календарот)
    room = get_room_or_404(db, slug)
    end = start + timedelta(days=days)
    rows = db.execute(
        select(Booking.date, Booking.time).where(
            Booking.room_id == room.id, Booking.date >= start, Booking.date < end, Booking.status != "cancelled"
        )
    ).all()
    taken: dict[date, set[str]] = {}
    for d, t in rows:
        taken.setdefault(d, set()).add(t)

    result = []
    for i in range(days):
        d = start + timedelta(days=i)
        free = sum(1 for t in SLOT_TIMES if t not in taken.get(d, set()) and not is_slot_in_past(d, t))
        result.append({"date": d.isoformat(), "free": free, "total": len(SLOT_TIMES)})
    return result


@router.get("/pricing")
def pricing():
    return {
        "table": PRICE_TABLE,
        "weekend_surcharge": WEEKEND_SURCHARGE,
        "slot_times": SLOT_TIMES,
        "booking_window_days": BOOKING_WINDOW_DAYS,
    }
