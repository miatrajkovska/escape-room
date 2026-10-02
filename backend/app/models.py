# Табели во базата
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(40), default="", server_default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name_mk: Mapped[str] = mapped_column(String(100))
    name_en: Mapped[str] = mapped_column(String(100))
    tagline_mk: Mapped[str] = mapped_column(String(200))
    tagline_en: Mapped[str] = mapped_column(String(200))
    description_mk: Mapped[str] = mapped_column(Text)
    description_en: Mapped[str] = mapped_column(Text)
    # Кратки точки одделени со "|"
    highlights_mk: Mapped[str] = mapped_column(Text, default="")
    highlights_en: Mapped[str] = mapped_column(Text, default="")
    difficulty: Mapped[int] = mapped_column(Integer)  # 1 = лесно, 3 = тешко
    min_players: Mapped[int] = mapped_column(Integer)
    max_players: Mapped[int] = mapped_column(Integer)
    duration_min: Mapped[int] = mapped_column(Integer)
    min_age: Mapped[int] = mapped_column(Integer, default=12)
    success_rate: Mapped[int] = mapped_column(Integer)  # процент тимови што излегле
    theme: Mapped[str] = mapped_column(String(30))  # клуч за SVG илустрацијата
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Booking(Base):
    __tablename__ = "bookings"
    # Еден термин може да има само една активна (неоткажана) резервација
    __table_args__ = (
        Index(
            "uq_active_slot",
            "room_id",
            "date",
            "time",
            unique=True,
            postgresql_where=text("status <> 'cancelled'"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    time: Mapped[str] = mapped_column(String(5))  # "18:00"
    players: Mapped[int] = mapped_column(Integer)
    price: Mapped[int] = mapped_column(Integer)  # во денари
    customer_name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(40))
    email: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="confirmed")  # confirmed / completed / cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    room: Mapped[Room] = relationship()


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), index=True)
    team_name: Mapped[str] = mapped_column(String(80))
    players: Mapped[int] = mapped_column(Integer)
    time_seconds: Mapped[int] = mapped_column(Integer)
    hints_used: Mapped[int] = mapped_column(Integer, default=0)
    played_on: Mapped[date] = mapped_column(Date)

    room: Mapped[Room] = relationship()


class GameScore(Base):
    __tablename__ = "game_scores"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    game: Mapped[str] = mapped_column(String(30), index=True)
    time_seconds: Mapped[int] = mapped_column(Integer)
    moves: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped[User] = relationship()


class GameAttempt(Base):
    # Одиграна игра што НЕ е добиена (изгубена или прекината), за да се знае дека корисникот играл
    __tablename__ = "game_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    game: Mapped[str] = mapped_column(String(30), index=True)
    result: Mapped[str] = mapped_column(String(10))  # lost / quit
    time_seconds: Mapped[int] = mapped_column(Integer)
    moves: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(30))  # news / tips / event
    cover: Mapped[str] = mapped_column(String(30))  # клуч за SVG илустрација
    title_mk: Mapped[str] = mapped_column(String(200))
    title_en: Mapped[str] = mapped_column(String(200))
    excerpt_mk: Mapped[str] = mapped_column(Text)
    excerpt_en: Mapped[str] = mapped_column(Text)
    body_mk: Mapped[str] = mapped_column(Text)
    body_en: Mapped[str] = mapped_column(Text)
    published_at: Mapped[date] = mapped_column(Date)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
