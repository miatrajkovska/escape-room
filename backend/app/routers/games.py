# /api/games – резултати од онлајн мини-игрите
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user
from ..db import get_db
from ..models import GameScore, User
from ..schemas import GameScoreIn

router = APIRouter(prefix="/api/games", tags=["games"])

GAMES = {"codebreaker", "memory", "cipher"}


def best_per_user(scores: list[GameScore]) -> list[GameScore]:
    # Резултатите се веќе сортирани, го чуваме само најдобриот за секој играч
    seen: set[int] = set()
    best = []
    for s in scores:
        if s.user_id not in seen:
            seen.add(s.user_id)
            best.append(s)
    return best


@router.post("/scores")
def submit_score(data: GameScoreIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.game not in GAMES:
        raise HTTPException(400, "Unknown game")
    score = GameScore(user_id=user.id, game=data.game, time_seconds=data.time_seconds, moves=data.moves)
    db.add(score)
    db.commit()

    # На кое место е играчот сега
    board = leaderboard(data.game, limit=1000, db=db)
    rank = next((row["rank"] for row in board if row["user_id"] == user.id), None)
    return {"ok": True, "rank": rank}


@router.get("/me")
def my_best(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = {}
    for game in GAMES:
        s = db.scalars(
            select(GameScore)
            .where(GameScore.user_id == user.id, GameScore.game == game)
            .order_by(GameScore.time_seconds, GameScore.moves)
            .limit(1)
        ).first()
        result[game] = {"time_seconds": s.time_seconds, "moves": s.moves} if s else None
    return result


@router.get("/{game}/leaderboard")
def leaderboard(game: str, limit: int = Query(default=10, le=1000), db: Session = Depends(get_db)):
    if game not in GAMES:
        raise HTTPException(404, "Unknown game")
    scores = db.scalars(
        select(GameScore)
        .options(joinedload(GameScore.user))
        .where(GameScore.game == game)
        .order_by(GameScore.time_seconds, GameScore.moves, GameScore.created_at)
    ).all()
    best = best_per_user(list(scores))[:limit]
    return [
        {
            "rank": i + 1,
            "player": s.user.name,
            "user_id": s.user_id,
            "time_seconds": s.time_seconds,
            "moves": s.moves,
            "created_at": s.created_at.isoformat(),
        }
        for i, s in enumerate(best)
    ]
