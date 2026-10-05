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


def _make_engine(url: str):
    return create_engine(
        url,
        pool_pre_ping=True,  # Neon ги затвора неактивните врски, па проверуваме пред употреба
        pool_recycle=300,
        pool_size=5,
        max_overflow=5,
        # prepare_threshold: безбедно со Neon pooler; connect_timeout: да не чекаме бесконечно
        connect_args={"prepare_threshold": None, "connect_timeout": 10},
    )


# Ако DATABASE_URL недостасува или е неисправен, апликацијата сепак стартува
# (за /api/health да покаже што не е во ред). Грешката се чува во ENGINE_ERROR.
ENGINE_ERROR: str | None = None
if not DATABASE_URL:
    ENGINE_ERROR = "DATABASE_URL is not set"
try:
    engine = _make_engine(_normalize(DATABASE_URL))
except Exception as e:
    ENGINE_ERROR = ENGINE_ERROR or f"{type(e).__name__}: invalid DATABASE_URL"
    # Лажна адреса што секогаш ќе падне при поврзување, но не го руши стартот
    engine = _make_engine("postgresql+psycopg://not-configured@localhost/none")

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
