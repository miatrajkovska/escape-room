# Поставки што се читаат од околината (.env локално, Environment на Render)
import os

from dotenv import load_dotenv

load_dotenv()

# NEON_DATABASE_URL има предност (на RepoRun DATABASE_URL се пребришува со host "postgres");
# ако ја нема, се користи DATABASE_URL (локално и на Render)
DATABASE_URL = os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL", "")
DATABASE_URL_SOURCE = "NEON_DATABASE_URL" if os.getenv("NEON_DATABASE_URL") else "DATABASE_URL"
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXPIRE_DAYS = 7

# Дозволени frontend адреси, одделени со запирка
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

# Временска зона на фирмата (за "денес" и поминати термини)
TIMEZONE = "Europe/Skopje"
