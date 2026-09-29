# /api/admin – само за администратори
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from ..auth import require_admin
from ..db import get_db
from ..models import Booking, ContactMessage, GameScore, LeaderboardEntry, User
from ..pricing import local_now
from ..schemas import BookingStatusIn, LeaderboardIn
from ..serializers import booking_out, leaderboard_out, user_out
from .rooms import get_room_or_404

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    today = local_now().date()
    active = Booking.status != "cancelled"
    return {
        "users": db.scalar(select(func.count(User.id))),
        "upcoming_bookings": db.scalar(select(func.count(Booking.id)).where(active, Booking.date >= today)),
        "today_bookings": db.scalar(select(func.count(Booking.id)).where(active, Booking.date == today)),
        "revenue_completed": db.scalar(
            select(func.coalesce(func.sum(Booking.price), 0)).where(Booking.status == "completed")
        ),
        "unread_messages": db.scalar(select(func.count(ContactMessage.id)).where(ContactMessage.is_read.is_(False))),
        "game_plays": db.scalar(select(func.count(GameScore.id))),
    }


@router.get("/bookings")
def bookings(
    scope: str = Query(default="upcoming", pattern="^(upcoming|past|all)$"),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
):
    today = local_now().date()
    q = select(Booking).options(joinedload(Booking.room))
    if scope == "upcoming":
        q = q.where(Booking.date >= today).order_by(Booking.date, Booking.time)
    elif scope == "past":
        q = q.where(Booking.date < today).order_by(Booking.date.desc(), Booking.time.desc())
    else:
        q = q.order_by(Booking.created_at.desc())
    return [booking_out(b) for b in db.scalars(q.limit(limit)).all()]


@router.patch("/bookings/{booking_id}")
def update_booking(booking_id: int, data: BookingStatusIn, db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id, options=[joinedload(Booking.room)])
    if not booking:
        raise HTTPException(404, "Booking not found")
    booking.status = data.status
    db.commit()
    return booking_out(booking)


@router.get("/messages")
def messages(db: Session = Depends(get_db)):
    rows = db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(100)).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "subject": m.subject,
            "message": m.message,
            "is_read": m.is_read,
            "created_at": m.created_at.isoformat(),
        }
        for m in rows
    ]


@router.patch("/messages/{message_id}/read")
def mark_read(message_id: int, db: Session = Depends(get_db)):
    msg = db.get(ContactMessage, message_id)
    if not msg:
        raise HTTPException(404, "Message not found")
    msg.is_read = True
    db.commit()
    return {"ok": True}


@router.get("/users")
def users(db: Session = Depends(get_db)):
    rows = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [user_out(u) | {"created_at": u.created_at.isoformat()} for u in rows]


@router.post("/leaderboard")
def add_leaderboard(data: LeaderboardIn, db: Session = Depends(get_db)):
    room = get_room_or_404(db, data.room_slug)
    entry = LeaderboardEntry(
        room_id=room.id,
        team_name=data.team_name.strip(),
        players=data.players,
        time_seconds=data.time_seconds,
        hints_used=data.hints_used,
        played_on=data.played_on,
    )
    db.add(entry)
    db.commit()
    entry.room = room
    return leaderboard_out(entry, 0)


@router.delete("/leaderboard/{entry_id}")
def delete_leaderboard(entry_id: int, db: Session = Depends(get_db)):
    entry = db.get(LeaderboardEntry, entry_id)
    if not entry:
        raise HTTPException(404, "Entry not found")
    db.delete(entry)
    db.commit()
    return {"ok": True}

