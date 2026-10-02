# /api/admin – само за администратори
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from ..auth import require_admin
from ..db import get_db
from ..models import Booking, ContactMessage, GameAttempt, GameScore, LeaderboardEntry, Room, User
from ..pricing import local_now
from ..schemas import BookingStatusIn, LeaderboardIn, RoomIn
from ..serializers import booking_out, leaderboard_out, room_out, user_out
from .rooms import clear_rooms_cache, get_room_or_404

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
        # Добиени + изгубени/прекинати игри
        "game_plays": db.scalar(select(func.count(GameScore.id))) + db.scalar(select(func.count(GameAttempt.id))),
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
    clear_rooms_cache()  # најдоброто време на собата можеби се сменило
    entry.room = room
    return leaderboard_out(entry, 0)


@router.delete("/leaderboard/{entry_id}")
def delete_leaderboard(entry_id: int, db: Session = Depends(get_db)):
    entry = db.get(LeaderboardEntry, entry_id)
    if not entry:
        raise HTTPException(404, "Entry not found")
    db.delete(entry)
    db.commit()
    clear_rooms_cache()
    return {"ok": True}


@router.get("/rooms")
def rooms_overview(db: Session = Depends(get_db)):
    # Преглед на собите со број на резервации и приход по соба
    today = local_now().date()
    rows = db.execute(
        select(
            Room,
            func.count(Booking.id).filter(Booking.status != "cancelled", Booking.date >= today),
            func.coalesce(func.sum(Booking.price).filter(Booking.status == "completed"), 0),
        )
        .outerjoin(Booking, Booking.room_id == Room.id)
        .group_by(Room.id)
        .order_by(Room.sort_order)
    ).all()
    return [room_out(r) | {"upcoming_bookings": up, "revenue": rev} for r, up, rev in rows]


@router.post("/rooms")
def add_room(data: RoomIn, db: Session = Depends(get_db)):
    if data.min_players > data.max_players:
        raise HTTPException(400, "Min players must be <= max players")
    if db.scalar(select(Room).where(Room.slug == data.slug)):
        raise HTTPException(409, "A room with this slug already exists")
    last = db.scalar(select(func.max(Room.sort_order))) or 0
    room = Room(
        **data.model_dump(exclude={"highlights_mk", "highlights_en"}),
        # Точките се чуваат како еден текст одделен со "|"
        highlights_mk="|".join(h.strip() for h in data.highlights_mk if h.strip()),
        highlights_en="|".join(h.strip() for h in data.highlights_en if h.strip()),
        sort_order=last + 1,
    )
    db.add(room)
    db.commit()
    clear_rooms_cache()
    return room_out(room)


@router.delete("/rooms/{slug}")
def delete_room(slug: str, db: Session = Depends(get_db)):
    # Бришењето ги брише и резервациите и рекордите за собата (CASCADE)
    room = get_room_or_404(db, slug)
    db.delete(room)
    db.commit()
    clear_rooms_cache()
    return {"ok": True}
