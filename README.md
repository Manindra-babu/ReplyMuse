# ReplyMuse — “Every reply, in your voice.”

Production-ready, privacy-first AI Review Reply SaaS designed for local businesses across India (restaurants, cafés, clinics, gyms, salons, boutiques, and trade services).

ReplyMuse learns the business owner’s communication style from 3 to 5 previous replies, then generates authentic, non-defensive responses that sound natural and preserve customer goodwill.

---

## 1. Key Features

- **Distinctive Editorial Writing Studio**: Warm ivory theme (`#F7F5EF`, `#20231F`, `#42664F`, `#E9795E`), typography pairing (`Newsreader` serif + `Plus Jakarta Sans`), fine borders, deliberate whitespace. Zero tacky purple gradients or decorative vanity metrics.
- **Guided 3-Step Onboarding**:
  1. Business details (Category, description, escalation channels).
  2. Previous replies (3 to 5 authentic examples with dynamic fields).
  3. Reusable voice profile extraction (Inferred tone, formality, length, greetings, sign-offs, preferred/avoided phrases).
- **Signature Review Composer**:
  - Review text input with live character counter.
  - Interactive 1 to 5 star rating selector.
  - Optional reviewer name and response language override (English, Hindi, Hinglish).
  - Versioned draft regenerations without overwriting earlier work.
  - Fine-tuning editor and one-click copy with clipboard fallback.
- **Safety & Non-Defensive De-escalation Protocol**:
  - Negative reviews receive calm, empathetic replies.
  - Verified business contact phone/email is offered for private resolution.
  - Sensitive claims (injury, food poisoning, threats) are flagged for human inspection.
  - Strict guardrails against hallucinating contact numbers, refunds, or false policy admissions.
  - Prompt-injection defenses isolate untrusted customer review text.
- **Persistent Versioned History**:
  - Full-text search and filtering by star rating, sentiment, and draft status (`draft`, `edited`, `copied`, `published`).
  - Access to prior draft generations for any review.
- **Freemium Quota Enforcement**:
  - Configurable server-enforced allowance (10 generations/month).
  - Atomic tracking via `usage_events` table within database transactions.
  - Quota reset date calculation (1st of each calendar month UTC).
- **Security & Privacy**:
  - Argon2id password hashing.
  - Secure session cookies / JWT authorization.
  - Generic account recovery to prevent user enumeration.
  - One-click account deletion cascading through all associated business data, drafts, and reviews.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (custom studio design tokens)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State & Data Fetching**: TanStack Query (React Query)
- **Testing**: Vitest, React Testing Library

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0 (Dual-engine: PostgreSQL & SQLite)
- **Migrations**: Alembic
- **Security**: Passlib with Argon2id, PyJWT, Secrets
- **AI Integration**: Google Gemini 1.5 Flash with deterministic fallback provider abstraction
- **Testing**: Pytest, pytest-asyncio, HTTPX TestClient

---

## 3. Database Architecture

Normalized PostgreSQL schema with UUID primary keys and UTC timestamps:

- `users`: User identity, Argon2id password hash, reset tokens, verification timestamps.
- `business_profiles`: Business name, category, description, verified contact email/phone, default language.
- `voice_profiles`: Reusable linguistic profile (tone, formality, length, greeting, sign-off, preferred/avoided phrases, first-person voice).
- `voice_examples`: Raw authentic reply samples provided by the business owner.
- `reviews`: Customer review text, star rating, reviewer name, detected sentiment.
- `reply_drafts`: Versioned generated drafts, edited replies, status, model provider, safety flags.
- `usage_events`: Atomic monthly generation events with idempotency keys.
- `subscriptions`: User plan tier (`free`) and billing cycle periods.

---

## 4. Environment Variables

### Backend (`backend/.env`)
```bash
APP_NAME=ReplyMuse
ENVIRONMENT=development
DEBUG=True
API_V1_STR=/api
PORT=8000
HOST=0.0.0.0

SECRET_KEY=generate_a_random_32_character_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
COOKIE_SECURE=False

# For SQLite (default local dev):
DATABASE_URL=sqlite+aiosqlite:///./replymuse.db
SYNC_DATABASE_URL=sqlite:///./replymuse.db

# For PostgreSQL / Neon in production:
# DATABASE_URL=postgresql+asyncpg://user:pass@ep-host.neon.tech/neondb?sslmode=require
# SYNC_DATABASE_URL=postgresql://user:pass@ep-host.neon.tech/neondb?sslmode=require

AI_PROVIDER=gemini # "gemini" or "mock"
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
MONTHLY_FREE_GENERATION_LIMIT=10
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL=/api
```

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start backend server (starts on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```
Swagger API documentation will be available at: `http://localhost:8000/api/docs`

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 6. Running Automated Tests

### Backend Tests
```bash
cd backend
pytest -v
```
Test suite coverage:
- `test_auth.py`: Registration, duplicate check, login, logout, password recovery, token expiration.
- `test_business.py`: Business profile CRUD, ownership isolation.
- `test_voice.py`: Voice analysis endpoint, example replies persistence, style customization.
- `test_reviews_drafts.py`: Positive replies, negative de-escalation with verified contact channels, sensitive allegations, prompt-injection defense, versioned draft regeneration, inline editing, copy status.
- `test_quotas.py`: Atomic 10-reply quota enforcement, 429 Too Many Requests response, monthly reset date.

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 7. Production Deployment Guide

### Option A: Managed Cloud Deployment
1. **Database**: Create a PostgreSQL instance on [Neon](https://neon.tech) or Supabase. Copy the connection string.
2. **Backend**: Deploy the `backend/` folder to Render, Railway, or Fly.io:
   - Build command: `pip install -r requirements.txt && alembic upgrade head`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - Configure environment variables from `.env.example`.
3. **Frontend**: Deploy `frontend/` to Vercel or Netlify:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set `VITE_API_URL` pointing to your deployed backend URL.

### Option B: Docker Compose
```bash
docker-compose up --build -d
```

---

## 8. Google Business Profile Integration Roadmap

ReplyMuse MVP uses an intentional, privacy-conscious manual copy-paste workflow to guarantee high quality and immediate launchability without complex verification hurdles.

See [`docs/GOOGLE_INTEGRATION_SPEC.md`](docs/GOOGLE_INTEGRATION_SPEC.md) for the complete OAuth2, location synchronization, and human-gated publishing architecture planned for Phase 2.
