# Претворање на објекти од базата во JSON речници
from .models import BlogPost, Booking, LeaderboardEntry, Room, User
from .pricing import can_cancel


def user_out(u: User) -> dict:
    return {"id": u.id, "name": u.name, "email": u.email, "phone": u.phone, "is_admin": u.is_admin}


def room_out(r: Room, best_time: int | None = None) -> dict:
    return {
        "id": r.id,
        "slug": r.slug,
        "name_mk": r.name_mk,
        "name_en": r.name_en,
        "tagline_mk": r.tagline_mk,
        "tagline_en": r.tagline_en,
        "description_mk": r.description_mk,
        "description_en": r.description_en,
        "highlights_mk": [h for h in r.highlights_mk.split("|") if h],
        "highlights_en": [h for h in r.highlights_en.split("|") if h],
        "difficulty": r.difficulty,
        "min_players": r.min_players,
        "max_players": r.max_players,
        "duration_min": r.duration_min,
        "min_age": r.min_age,
        "success_rate": r.success_rate,
        "theme": r.theme,
        "best_time": best_time,
    }


def booking_out(b: Booking) -> dict:
    return {
        "id": b.id,
        "code": b.code,
        "room_slug": b.room.slug,
        "room_name_mk": b.room.name_mk,
        "room_name_en": b.room.name_en,
        "room_theme": b.room.theme,
        "date": b.date.isoformat(),
        "time": b.time,
        "players": b.players,
        "price": b.price,
        "customer_name": b.customer_name,
        "phone": b.phone,
        "email": b.email,
        "notes": b.notes,
        "status": b.status,
        # Дали корисникот може сам да ја откаже (до 24 часа пред терминот)
        "can_cancel": b.status == "confirmed" and can_cancel(b.date, b.time),
        "created_at": b.created_at.isoformat(),
    }


def leaderboard_out(e: LeaderboardEntry, rank: int) -> dict:
    return {
        "id": e.id,
        "rank": rank,
        "team_name": e.team_name,
        "players": e.players,
        "time_seconds": e.time_seconds,
        "hints_used": e.hints_used,
        "played_on": e.played_on.isoformat(),
        "room_slug": e.room.slug,
    }


def post_out(p: BlogPost, with_body: bool = False) -> dict:
    data = {
        "slug": p.slug,
        "category": p.category,
        "cover": p.cover,
        "title_mk": p.title_mk,
        "title_en": p.title_en,
        "excerpt_mk": p.excerpt_mk,
        "excerpt_en": p.excerpt_en,
        "published_at": p.published_at.isoformat(),
    }
    if with_body:
        data["body_mk"] = p.body_mk
        data["body_en"] = p.body_en
    return data
