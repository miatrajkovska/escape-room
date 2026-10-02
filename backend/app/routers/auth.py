# /api/auth – регистрација, најава, мој профил
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

from ..auth import create_token, get_current_user, hash_password, verify_password
from ..db import get_db
from ..models import Booking, GameAttempt, GameScore, User
from ..pricing import local_now
from ..schemas import LoginIn, ProfileIn, RegisterIn
from ..serializers import user_out

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    exists = db.scalar(select(User).where(func.lower(User.email) == email))
    if exists:
        raise HTTPException(409, "Email already registered")
    user = User(name=data.name.strip(), email=email, phone=data.phone.strip(), password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    return {"token": create_token(user), "user": user_out(user)}


@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(func.lower(User.email) == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"token": create_token(user), "user": user_out(user)}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user_out(user)


@router.patch("/me")
def update_me(data: ProfileIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Уредување на име, е-пошта и телефон
    email = data.email.lower()
    taken = db.scalar(select(User).where(func.lower(User.email) == email, User.id != user.id))
    if taken:
        raise HTTPException(409, "Email already registered")
    user.name = data.name.strip()
    user.email = email
    user.phone = data.phone.strip()
    db.commit()
    return user_out(user)


@router.delete("/me")
def delete_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Бришење на профилот: резултатите од сите игри се бришат (исчезнуваат од ранг-листите)
    db.execute(delete(GameScore).where(GameScore.user_id == user.id))
    db.execute(delete(GameAttempt).where(GameAttempt.user_id == user.id))
    # Идните резервации се откажуваат за да се ослободат термините
    db.execute(
        update(Booking)
        .where(Booking.user_id == user.id, Booking.status == "confirmed", Booking.date >= local_now().date())
        .values(status="cancelled")
    )
    # Минатите резервации остануваат кај админот, но без врска со профилот
    db.execute(update(Booking).where(Booking.user_id == user.id).values(user_id=None))
    db.delete(user)
    db.commit()
    return {"ok": True}
