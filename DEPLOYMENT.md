# ReplyMuse Production Deployment Guide

This guide covers deploying **ReplyMuse** to production with a separate frontend (Vercel / Cloudflare Pages / Netlify) and backend (Railway / Render / Fly.io / Google Cloud Run) connected to a managed PostgreSQL database (Neon / Supabase / AWS RDS).

---

## 1. Architecture Overview

- **Frontend**: React 18 SPA (Vite) hosted on Vercel, Netlify, or Cloudflare Pages.
- **Backend**: FastAPI (Python 3.11+) containerized with Docker or deployed directly on Railway/Render.
- **Database**: Managed PostgreSQL with async driver (`postgresql+asyncpg://...`).
- **AI Engine**: Google Gemini API (`gemini-1.5-flash` or `gemini-1.5-pro`).
- **Auth**: Stateless JWT (`HS256`) with HTTP Authorization Bearer headers.

---

## 2. Environment Variables

### Backend (`backend/.env`)

| Variable | Staging Value | Production Value | Description |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | `ReplyMuse Staging` | `ReplyMuse` | Displayed in health checks and telemetry |
| `ENVIRONMENT` | `staging` | `production` | Enforces strict error masking and security checks |
| `DEBUG` | `False` | `False` | Disables debug logs and stack trace leakage |
| `HOST` | `0.0.0.0` | `0.0.0.0` | Server bind host |
| `PORT` | `8000` | `8000` | Server bind port |
| `API_V1_STR` | `/api` | `/api` | API path prefix |
| `SECRET_KEY` | *(Random 64-char string)* | *(Random 64-char string)* | JWT signing secret (`openssl rand -hex 32`) |
| `ALGORITHM` | `HS256` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | `1440` | Token lifetime (24 hours) |
| `DATABASE_URL` | `postgresql+asyncpg://...` | `postgresql+asyncpg://...` | Async connection string for PostgreSQL |
| `SYNC_DATABASE_URL` | `postgresql://...` | `postgresql://...` | Sync connection string for Alembic migrations |
| `AI_PROVIDER` | `gemini` | `gemini` | AI provider (`gemini` or `mock` for dry-run testing) |
| `GEMINI_API_KEY` | `your_staging_key` | `your_production_key` | Google Cloud / AI Studio Gemini API Key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | `gemini-1.5-flash` | Default Gemini model identifier |
| `AI_TIMEOUT_SECONDS` | `30` | `30` | Max timeout before transient retry |
| `AI_MAX_RETRIES` | `2` | `2` | Transient failure retry limit |
| `MONTHLY_FREE_GENERATION_LIMIT`| `10` | `10` | Free generation allowance per calendar month |
| `BACKEND_CORS_ORIGINS` | `["https://staging.replymuse.com"]` | `["https://replymuse.com","https://www.replymuse.com"]` | Whitelisted frontend origins |

### Frontend (`frontend/.env`)

| Variable | Staging Value | Production Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `https://api-staging.replymuse.com/api` | `https://api.replymuse.com/api` | Backend API base URL |

---

## 3. Step-by-Step Deployment

### Step A: Set up Managed PostgreSQL (Neon / Supabase)
1. Create a project at [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the connection string.
3. Formulate the two required URLs:
   - **Async URL**: `postgresql+asyncpg://user:password@ep-host.region.neon.tech/neondb?ssl=require`
   - **Sync URL**: `postgresql://user:password@ep-host.region.neon.tech/neondb?sslmode=require`

### Step B: Deploy Backend (e.g. Railway or Render)
1. Create a new service from your Git repository using the `backend` root.
2. If using Docker, point the builder to `backend/Dockerfile`.
3. Configure the environment variables listed in Section 2 above.
4. Set the Start Command (if not using Dockerfile):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. Verify deployment by visiting `https://your-api-url.com/api/health`. You should receive:
   ```json
   {"status":"healthy","service":"ReplyMuse","environment":"production","ai_provider":"gemini"}
   ```

### Step C: Deploy Frontend (e.g. Vercel)
1. Import the Git repository in [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set Framework Preset to `Vite`.
4. Configure Build Command: `npm run build` and Output Directory: `dist`.
5. Add Environment Variable:
   - `VITE_API_URL`: `https://your-api-url.com/api`
6. Deploy. Vercel will automatically apply SPA route rewrites and security headers from `frontend/vercel.json`.

---

## 4. Custom Domains & DNS Setup

1. **Frontend Domain**:
   - `replymuse.com` -> Add `A` record pointing to Vercel IP `76.76.21.21` (or CNAME `cname.vercel-dns.com`).
   - `www.replymuse.com` -> Add `CNAME` pointing to `cname.vercel-dns.com`.
2. **Backend API Domain**:
   - `api.replymuse.com` -> Add `CNAME` pointing to your Railway / Render default URL.
3. Update `BACKEND_CORS_ORIGINS` in your backend environment variables to include the new custom domains:
   ```json
   ["https://replymuse.com", "https://www.replymuse.com"]
   ```

---

## 5. Post-Deployment Verification Checklist

- [ ] Check `https://api.replymuse.com/api/health` returns `200 OK` with `"status": "healthy"`.
- [ ] Visit `https://replymuse.com/` and confirm hero background loads with zero layout shifts.
- [ ] Test registration with a new account.
- [ ] Complete onboarding flow (business details + paste 3 sample replies).
- [ ] Generate a reply for a 5-star review in the Studio Composer.
- [ ] Check Review History and verify the draft is saved.
- [ ] Verify Quota pill decrements from `10` to `9`.
- [ ] Edit a draft and verify status updates to `edited`.
- [ ] Test one-click copy to clipboard.
- [ ] Visit `/privacy` and `/terms` to confirm clean rendering.
- [ ] Open developer tools Network tab to ensure no stack traces or sensitive credentials are transmitted.
