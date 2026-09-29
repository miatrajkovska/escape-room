# Поставки што се читаат од околината (.env локално, Environment на Render)
import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXPIRE_DAYS = 7

# Дозволени frontend адреси, одделени со запирка
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

# Временска зона на фирмата (за "денес" и поминати термини)
TIMEZONE = "Europe/Skopje"
