# Task Manager — Full Stack (Vercel + Railway + Supabase)

Separate **frontend** (React on Vercel) and **backend** (Express on Railway) with **Supabase** (PostgreSQL) as the database.

## Project structure

```
full-stack-deployment/
├── backend/          # Node.js + Express API → deploy to Railway
├── frontend/         # React (Vite) app      → deploy to Vercel
├── supabase/
│   └── schema.sql    # Run once in Supabase SQL Editor
└── README.md
```

## Quick start (local)

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste and run `supabase/schema.sql`.
3. In **Project Settings → API**, copy:
   - **Project URL**
   - **service_role** key (backend only — never expose in the frontend)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## Deploy backend on Railway

### Prerequisites

- GitHub repo with this project (or push `backend/` as root — see **Option B** below).
- Supabase project with `schema.sql` applied.

### Option A — Monorepo (recommended)

1. Push the whole repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. Railway creates one service. Open the service → **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: (leave default or `npm install`)
   - **Start Command**: `npm start`
5. **Variables** tab — add:

   | Variable | Value |
   |----------|--------|
   | `SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (set after Vercel deploy) |
   | `NODE_ENV` | `production` |

   Railway sets `PORT` automatically — do not override it.

6. **Settings → Networking → Generate Domain** — copy the public URL (e.g. `https://task-api-production.up.railway.app`).

7. Test: open `https://YOUR-RAILWAY-URL/api/health` — should return `{"status":"ok"}`.

### Option B — Backend-only repo

If you only deploy the `backend` folder as its own repo, set **Root Directory** to `/` and use the same env vars.

### Redeploy

Push to `main` on the connected branch — Railway redeploys automatically.

---

## Deploy frontend on Vercel (summary)

1. [vercel.com](https://vercel.com) → **Add New Project** → import repo.
2. **Root Directory**: `frontend`
3. **Environment variable**:
   - `VITE_API_URL` = your Railway URL (no trailing slash), e.g. `https://task-api-production.up.railway.app`
4. Deploy.
5. Go back to Railway → set `FRONTEND_URL` to your Vercel URL (e.g. `https://task-manager.vercel.app`) → redeploy backend so CORS allows your site.

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create task `{ title, description? }` |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

---

## Troubleshooting

- **CORS errors**: Ensure `FRONTEND_URL` on Railway exactly matches your Vercel URL (https, no trailing slash).
- **502 on Railway**: Check logs; confirm `SUPABASE_*` vars are set and schema was applied.
- **Empty tasks / DB errors**: Re-run `supabase/schema.sql` in Supabase SQL Editor.
