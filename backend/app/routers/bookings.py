# /api/bookings – правење и откажување резервации
import secrets
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, get_optional_user
from ..db import get_db
from ..models import Booking, User
from ..pricing import (
    BOOKING_WINDOW_DAYS,
    MAX_ACTIVE_PER_PHONE,
    SLOT_TIMES,
    calc_price,
    can_cancel,
    digits,
    is_slot_in_past,
    local_now,
)
from ..schemas import BookingIn, CancelByCodeIn
from ..serializers import booking_out
from .rooms import get_room_or_404, taken_times

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def new_code() -> str:
    # Краток код за резервацијата, на пр. PE-7K2Q9
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "PE-" + "".join(secrets.choice(alphabet) for _ in range(5))


@router.post("")
def create_booking(data: BookingIn, user: User | None = Depends(get_optional_user), db: Session = Depends(get_db)):
    # Може и без профил (гостин): тогаш user е None и резервацијата не е врзана за корисник
    room = get_room_or_404(db, data.room_slug)

    if data.website:
        raise HTTPException(400, "Invalid request")
    if data.time not in SLOT_TIMES:
        raise HTTPException(400, "Invalid time slot")
    if is_slot_in_past(data.date, data.time):
        raise HTTPException(400, "This time slot is in the past")
    if data.date > local_now().date() + timedelta(days=BOOKING_WINDOW_DAYS):
        raise HTTPException(400, "Too far in advance")
    if not (room.min_players <= data.players <= room.max_players):
        raise HTTPException(400, f"This room is for {room.min_players}-{room.max_players} players")
    if data.time in taken_times(db, room.id, data.date):
        raise HTTPException(409, "This time slot is already booked")
    # Ист телефон не може да има премногу претстојни резервации
    upcoming_phones = db.scalars(
        select(Booking.phone).where(Booking.status == "confirmed", Booking.date >= local_now().date())
    ).all()
    if sum(digits(p) == digits(data.phone) for p in upcoming_phones) >= MAX_ACTIVE_PER_PHONE:
        raise HTTPException(429, "Too many active bookings for this phone number")

    booking = Booking(
        code=new_code(),
        room_id=room.id,
        user_id=user.id if user else None,
        date=data.date,
        time=data.time,
        players=data.players,
        price=calc_price(data.players, data.date),
        customer_name=data.customer_name.strip(),
        phone=data.phone.strip(),
        email=data.email.lower(),
        notes=data.notes.strip(),
    )
    db.add(booking)
    try:
        db.commit()
    except IntegrityError:
        # Некој друг го зел терминот во истиот момент
        db.rollback()
        raise HTTPException(409, "This time slot is already booked")
    booking.room = room
    return booking_out(booking)


@router.get("/me")
def my_bookings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Booking)
        .options(joinedload(Booking.room))
        .where(Booking.user_id == user.id)
        .order_by(Booking.date.desc(), Booking.time.desc())
    ).all()
    return [booking_out(b) for b in rows]


@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id, options=[joinedload(Booking.room)])
    if not booking or booking.user_id != user.id:
        raise HTTPException(404, "Booking not found")
    return cancel(booking, db)


@router.post("/cancel-by-code")
def cancel_by_code(data: CancelByCodeIn, db: Session = Depends(get_db)):
    # За гости: резервацијата се наоѓа по код, а телефонот мора да се совпаѓа
    booking = db.scalar(
        select(Booking).options(joinedload(Booking.room)).where(Booking.code == data.code.strip().upper())
    )
    if not booking or digits(booking.phone) != digits(data.phone):
        raise HTTPException(404, "Booking not found")
    return cancel(booking, db)


def cancel(booking: Booking, db: Session) -> dict:
    # Бесплатно откажување само до 24 часа пред терминот
    if booking.status != "confirmed" or not can_cancel(booking.date, booking.time):
        raise HTTPException(400, "This booking can no longer be cancelled")
    booking.status = "cancelled"
    db.commit()
    return booking_out(booking)
