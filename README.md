# ReplyMuse — “Every reply, in your voice.”

[![Deploy with Vercel](https://vercel.com/button)](https://replymuse.vercel.app)
[![API Status](https://img.shields.io/badge/Render-API%20Live-1F7A5C)](https://replymuse.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Neon-PostgreSQL%20Serverless-00E599)](https://neon.tech)
[![AI Provider](https://img.shields.io/badge/Google-Gemini%201.5%20Flash-4285F4)](https://ai.google.dev/)

**ReplyMuse** is a production-grade, editorial-crafted AI Review Reply studio designed for local businesses (cafes, restaurants, clinics, salons, boutiques, and trade services). 

Instead of generating generic ChatGPT-style responses, ReplyMuse extracts the business owner’s unique voice profile (formality, greeting, sign-off, preferred/avoided words) from 3–5 real past replies, then crafts authentic, non-defensive responses that protect customer goodwill and convert positive feedback into repeat guests.

---

## 🌐 Live Production Deployments

- **Web Application**: [https://replymuse.vercel.app](https://replymuse.vercel.app) (Hosted on Vercel)
- **REST API Backend**: [https://replymuse.onrender.com](https://replymuse.onrender.com) (Hosted on Render with Docker)
- **Interactive API Docs (Swagger UI)**: [https://replymuse.onrender.com/api/docs](https://replymuse.onrender.com/api/docs)
- **API Health Check**: [https://replymuse.onrender.com/api/health](https://replymuse.onrender.com/api/health)
- **Database**: Serverless PostgreSQL with connection pooling on [Neon](https://neon.tech)

---

## ✨ Key Features & Capabilities

- **Distinctive Editorial Writing Studio**:
  - Warm frosted-glass cream navbar (`#F7F3E8`), deep forest green (`#1F7A5C`), vibrant coral pill CTA (`#EE6A4B`).
  - Typography pairing: `Newsreader` editorial serif with `Plus Jakarta Sans`.
  - Zero generic purple AI gradients or tacky decorative metrics.

- **Dual Authentication**:
  - **Google Identity Services (One-Tap & Popup)**: Seamless Google authentication with automated account provisioning and free tier subscription enrollment.
  - **Email & Password**: Cryptographically secured with `Argon2id` hashing and JWT bearer tokens.

- **Signature 3-Step Voice Onboarding**:
  1. **Business Profile**: Category, name, location, and verified private escalation channels.
  2. **Sample Replies**: 3 to 5 authentic past responses written by the owner.
  3. **Linguistic Style Extraction**: Automatically isolates tone, formality, typical greetings, custom sign-offs, and rules on phrases to always use or avoid.

- **Review Reply Composer**:
  - Review input with live character counter (up to 2,000 characters).
  - Interactive 1–5 star rating selector.
  - Multi-language support (English, Hindi, Hinglish).
  - Versioned draft generations without overwriting prior attempts.
  - Inline editing and one-click copy with clipboard toast notifications.

- **Safety & De-escalation Guardrails**:
  - Empathetic, non-defensive resolution for critical or negative reviews.
  - Automatically offers verified owner phone/email for private resolution.
  - Flags sensitive allegations (injury, food poisoning, legal threats) for human review.
  - Strict system prompt protections against prompt injection (`<untrusted_customer_review>`).

- **Freemium Quota Enforcement**:
  - 10 free generations/month strictly enforced on the server.
  - Quotas are only consumed when AI generations succeed (zero consumption on network or provider errors).
  - Sliding-window rate limiting (10 requests/minute per authenticated user).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom editorial design tokens
- **Routing**: React Router v6
- **Data Fetching & State**: TanStack React Query
- **Icons**: Lucide React
- **Launch Video**: Rendered with Hyperframes & GSAP

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0 Async (`asyncpg` for PostgreSQL, `aiosqlite` for local dev)
- **Database**: Neon Serverless PostgreSQL
- **Security**: Argon2id password hashing, PyJWT, Starlette CORS & security headers
- **AI Engine**: Google Gemini 1.5 Flash (`google-generativeai`) with exponential backoff and timeout handling
- **Containerization**: Multi-stage Docker build

---

## 🚀 Quickstart for Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
Swagger UI will be live at `http://localhost:8000/api/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local

# Run Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

### Backend Unit & Integration Tests (18 passing tests)
```bash
cd backend
pytest -v
```
Covers:
- `test_auth.py`: Registration, duplicate checks, Google auth token verification, JWT lifecycle.
- `test_business.py`: Profile CRUD, multi-tenant ownership isolation.
- `test_voice.py`: Voice profile extraction, style guidelines, example storage.
- `test_reviews_drafts.py`: Positive replies, negative de-escalation, sensitive flags, prompt injection defense, draft versioning.
- `test_quotas.py`: Atomic 10-reply quota enforcement, 429 response, rate-limiter validation.

### Frontend Smoke Tests
```bash
cd frontend
npm test
```

---

## 📁 Repository Structure

```text
ReplyMuse/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI route controllers (auth, business, voice, reviews, drafts, quotas)
│   │   ├── models/         # SQLAlchemy ORM models (user, business, voice, review, draft, subscription)
│   │   ├── schemas/        # Pydantic v2 validation models
│   │   ├── services/       # AI providers (Gemini), quota service, voice extractor
│   │   ├── utils/          # Argon2id security, rate limiting, prompts
│   │   ├── config.py       # Pydantic settings & env validation
│   │   ├── database.py     # Async SQLAlchemy engine & Neon URL normalizer
│   │   └── main.py         # FastAPI application entrypoint & middleware
│   ├── tests/              # Pytest test suite (18 automated tests)
│   ├── Dockerfile          # Backend container specification
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components & GoogleSignInButton
│   │   ├── pages/          # Landing, Login, Register, Onboarding, Compose, History, Settings
│   │   ├── services/       # Axios/fetch API clients
│   │   └── styles/         # Tailwind design tokens & typography
│   ├── public/             # Favicon, robots.txt, sitemap.xml, assets
│   ├── vercel.json         # SPA rewrites & security headers
│   └── package.json
├── brag-output/            # 18-second Hyperframes launch video & assets
├── Dockerfile              # Root container specification for Render/Railway auto-detection
├── DEPLOYMENT.md           # End-to-end production deployment guide
└── README.md               # Project documentation
```

---

## 📄 License

ReplyMuse is distributed under the [MIT License](LICENSE).
