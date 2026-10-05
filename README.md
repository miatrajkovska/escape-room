# Press Esc

*Излезот е внатре. / The Way Out Is In.*

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
| demo@pressesc.mk | demo123 | корисник (има резервации) |
| admin@pressesc.mk | admin123 | администратор |
| mia@test.com | mia | администратор |

Ресет на демо податоците: `cd backend && .venv/Scripts/python -m app.seed --reset`

## Deploy
1. **Render** (backend): New → Blueprint → ова репо (`render.yaml`). Во Environment внесете `DATABASE_URL` (Neon).
2. **Vercel** (frontend): New Project → ова репо, Root Directory = `frontend`,
   Environment Variable `NEXT_PUBLIC_API_URL` = URL-то од Render (на пр. `https://enigma-escape-api.onrender.com`).

Бесплатниот Render сервер „заспива“ по 15 мин. неактивност – првото барање трае до ~1 минута.

## Deploy на RepoRun (Docker Compose)
Фајлови: `docker-compose.yml`, `stack.yml`, `frontend/Dockerfile`, `backend/Dockerfile`.
- `web` (Next.js, порта 3000) е единствениот јавен сервис. `api` (FastAPI) е само внатрешен (`http://api:8001`).
- Прелистувачот вика `/api/...` на истиот домен, а Next.js го препраќа до `api` (rewrites во `next.config.ts`).
- Базата останува Neon, па нема postgres сервис. Табелите и демо податоците backend-от ги прави сам при старт.
- Build-от на `web` не го вика API-то (собите се земаат при барање, `connection()` во `server-data.ts`).

Environment во RepoRun UI: `DATABASE_URL` (Neon), `JWT_SECRET` (долга случајна низа).
Потоа на страницата на стекот: **Validate** → **Deploy**.

Ако RepoRun не дозволува `build` (`compose.service.build_unsupported`): images се градат и качуваат
на GHCR, а во `docker-compose.yml` `build:` се заменува со `image: ghcr.io/<user>/pressesc-web:latest`
(и `pressesc-api`).
