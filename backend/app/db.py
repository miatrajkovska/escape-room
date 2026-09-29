# Врска со Neon Postgres базата
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL


def _normalize(url: str) -> str:
    # SQLAlchemy треба да знае дека користиме psycopg (v3) драјвер
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


engine = create_engine(
    _normalize(DATABASE_URL),
    pool_pre_ping=True,  # Neon ги затвора неактивните врски, па проверуваме пред употреба
    pool_recycle=300,
    pool_size=5,
    max_overflow=5,
    connect_args={"prepare_threshold": None},  # безбедно со Neon pooler
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    # FastAPI dependency: нова сесија за секое барање
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
