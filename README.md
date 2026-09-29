# Enigma Escape

Веб-страница за измислена escape room фирма (студентски проект, Деловна пракса – ФИНКИ 2025/2026).

- `frontend/` – Next.js + Tailwind + shadcn/ui → Vercel
- `backend/` – FastAPI + SQLAlchemy + Neon Postgres → Render

## Локално стартување

**Backend** (порта 8001):
```bash
cd backend
py -3.12 -m venv .venv
.venv/Scripts/pip install -r requirements.txt
cp .env.example .env   # внесете DATABASE_URL од Neon
.venv/Scripts/python -m uvicorn app.main:app --port 8001 --reload
```
API документација: http://localhost:8001/docs

**Frontend** (порта 3000):
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Демо профили
| Е-пошта | Лозинка | Улога |
|---|---|---|
| demo@enigma.mk | demo123 | корисник (има резервации) |
| admin@enigma.mk | admin123 | администратор |

Ресет на демо податоците: `cd backend && .venv/Scripts/python -m app.seed --reset`

## Deploy
1. **Render** (backend): New → Blueprint → ова репо (`render.yaml`). Во Environment внесете `DATABASE_URL` (Neon).
2. **Vercel** (frontend): New Project → ова репо, Root Directory = `frontend`,
   Environment Variable `NEXT_PUBLIC_API_URL` = URL-то од Render (на пр. `https://enigma-escape-api.onrender.com`).

Бесплатниот Render сервер „заспива“ по 15 мин. неактивност – првото барање трае до ~1 минута.
