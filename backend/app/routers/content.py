# /api/posts и /api/contact – блог и контакт форма
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import BlogPost, ContactMessage
from ..schemas import ContactIn
from ..serializers import post_out

router = APIRouter(prefix="/api", tags=["content"])


@router.get("/posts")
def list_posts(db: Session = Depends(get_db)):
    posts = db.scalars(select(BlogPost).order_by(BlogPost.published_at.desc())).all()
    return [post_out(p) for p in posts]


@router.get("/posts/{slug}")
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.scalar(select(BlogPost).where(BlogPost.slug == slug))
    if not post:
        raise HTTPException(404, "Post not found")
    return post_out(post, with_body=True)


@router.post("/contact")
def contact(data: ContactIn, db: Session = Depends(get_db)):
    db.add(ContactMessage(**data.model_dump()))
    db.commit()
    return {"ok": True}
