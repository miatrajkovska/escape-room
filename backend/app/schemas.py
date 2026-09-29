# Pydantic модели за влезни податоци (што праќа frontend-от)
from datetime import date

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class BookingIn(BaseModel):
    room_slug: str
    date: date
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    players: int = Field(ge=2, le=6)
    customer_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=6, max_length=40)
    notes: str = Field(default="", max_length=1000)


class GameScoreIn(BaseModel):
    game: str
    time_seconds: int = Field(ge=3, le=3600)
    moves: int = Field(ge=1, le=1000)


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=5, max_length=5000)


class BookingStatusIn(BaseModel):
    status: str = Field(pattern=r"^(confirmed|completed|cancelled)$")


class LeaderboardIn(BaseModel):
    room_slug: str
    team_name: str = Field(min_length=2, max_length=80)
    players: int = Field(ge=2, le=6)
    time_seconds: int = Field(ge=60, le=6000)
    hints_used: int = Field(default=0, ge=0, le=20)
    played_on: date

