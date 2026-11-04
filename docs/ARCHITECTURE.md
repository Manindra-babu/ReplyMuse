# ReplyMuse System Architecture & Engineering Specification

## 1. Executive Overview

ReplyMuse is an editorial writing studio designed for local business owners across India (restaurants, clinics, gyms, salons, retail, trades). It transforms customer reviews into authentic, thoughtful replies that mirror the owner's genuine communication style.

Tagline: **“Every reply, in your voice.”**

---

## 2. Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 18 + Vite + TypeScript + Tailwind CSS                                      |
|  - Warm Ivory Editorial Writing Studio Theme (#F7F5EF, #20231F, #42664F, #E9795E)  |
|  - React Router v6 + TanStack React Query + React Hook Form                       |
|  - Clipboard API with Fallback Buffer                                             |
+-----------------------------------------------------------------------------------+
                                        |
                            HTTP / REST (Secure Cookies / JWT)
                                        v
+-----------------------------------------------------------------------------------+
|                                BACKEND TIER                                       |
|  FastAPI (Python 3.10+)                                                           |
|  - Security: Argon2id Hashing, Constant-time checks, Generic Recovery Protection   |
|  - Quota Engine: Atomic Transactional Counter (10 Free Generations / Month)       |
|  - Prompt Injection Defense: Structured XML Delimiters, Untrusted Data Isolation  |
+-----------------------------------------------------------------------------------+
                 |                                                |
                 v                                                v
+----------------------------------+            +----------------------------------+
|           DATABASE TIER          |            |             AI TIER              |
|  PostgreSQL / SQLite Dual Engine |            |  Abstract Base AI Provider       |
|  - UUID Primary Keys             |            |  - Google Gemini 1.5 Flash       |
|  - UTC Timestamps                |            |  - Deterministic Studio Fallback |
|  - Alembic Migrations            |            |  - Bounded Retries & Timeouts    |
+----------------------------------+            +----------------------------------+
```

---

## 3. Database Schema Design

The database schema is fully normalized and supports PostgreSQL (Neon, Supabase, RDS) or SQLite (for zero-configuration local execution):

1. **`users`**:
   - `id`: UUID (Primary Key)
   - `email`: String (Unique, Indexed)
   - `password_hash`: String (Argon2id cryptographic hash)
   - `email_verified_at`: Timestamp (Nullable)
   - `reset_token`: String (Nullable, Indexed)
   - `reset_token_expires_at`: Timestamp (Nullable)
   - `deleted_at`: Timestamp (Soft delete flag)

2. **`business_profiles`**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key `users.id`, Unique Constraint)
   - `business_name`, `category`, `description`: Text
   - `contact_email`, `contact_phone`: Verified escalation channels
   - `default_language`, `preferred_greeting`, `preferred_sign_off`

3. **`voice_profiles`**:
   - `id`: UUID (Primary Key)
   - `business_id`: UUID (Foreign Key `business_profiles.id`, Unique Constraint)
   - `tone`, `formality`, `preferred_length`, `greeting`, `sign_off`
   - `preferred_phrases` (JSON list), `avoided_phrases` (JSON list)
   - `first_person_style`: "we" or "I"
   - `language_preference`: "en", "hi", "hinglish"

4. **`voice_examples`**:
   - `id`: UUID (Primary Key)
   - `business_id`: UUID (Foreign Key `business_profiles.id`)
   - `example_text`: Text

5. **`reviews`**:
   - `id`: UUID (Primary Key)
   - `business_id`: UUID (Foreign Key `business_profiles.id`)
   - `review_text`: Text
   - `reviewer_name`: String (Nullable)
   - `star_rating`: Integer (1-5, Nullable)
   - `detected_sentiment`: String (`positive`, `neutral`, `negative`, `sensitive`)

6. **`reply_drafts`**:
   - `id`: UUID (Primary Key)
   - `review_id`: UUID (Foreign Key `reviews.id`)
   - `model_provider`, `model_name`
   - `original_draft`, `edited_reply`
   - `status`: `draft`, `edited`, `copied`, `published`
   - `safety_flags`: JSON (`is_sensitive`, `allegation_detected`, `private_channel_offered`)

7. **`usage_events`**:
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (Foreign Key `users.id`, Indexed)
   - `event_type`: "generation"
   - `quantity`: 1
   - `idempotency_key`: String (Unique)

---

## 4. Prompt-Injection & Data Safety Defenses

ReplyMuse strictly treats customer reviews as untrusted input. The system enforces:
1. **Explicit Prompt Separation**: Customer review text is wrapped in `<untrusted_customer_review>` tags. System instructions explicitly prohibit the model from interpreting user reviews as system directives.
2. **Contact Hallucination Prevention**: The AI prompt strictly forbids hallucinating phone numbers, emails, discounts, refunds, or legal admissions. Verified contact channels are passed only when provided by the business owner.
3. **Structured JSON Validation**: Generation outputs are parsed into typed Pydantic objects (`reply`, `sentiment`, `safety_flags`). Any raw text output failing schema checks is safely intercepted.
4. **Data Isolation**: Multi-tenant authorization checks verify ownership on every database operation; clients cannot manipulate resource IDs.
