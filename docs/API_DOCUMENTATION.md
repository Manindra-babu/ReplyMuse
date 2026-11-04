# ReplyMuse REST API Documentation

Base URL: `http://localhost:8000/api`
Interactive Swagger Docs: `http://localhost:8000/api/docs`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account and free tier subscription.
- **Request Body**:
  ```json
  {
    "email": "owner@restaurant.in",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "access_token": "eyJhbGciOiJIUz...",
    "token_type": "bearer",
    "user": {
      "id": "uuid",
      "email": "owner@restaurant.in",
      "is_active": true,
      "email_verified": true,
      "created_at": "2026-10-27T12:00:00Z",
      "has_business_profile": false,
      "has_voice_profile": false
    }
  }
  ```

### `POST /api/auth/login`
Authenticates a user and issues JWT in Bearer response and HTTP-only cookie.
- **Response**: `200 OK`

### `POST /api/auth/logout`
Clears HTTP-only session cookie.
- **Response**: `200 OK`

### `GET /api/auth/me`
Retrieves current authenticated user details and profile setup status.
- **Response**: `200 OK`

### `POST /api/auth/forgot-password`
Initiates secure password recovery. Returns generic message to prevent account enumeration.

### `POST /api/auth/reset-password`
Resets password using a validated recovery token.

---

## 2. Business Profile Endpoints

### `GET /api/business/profile`
Retrieves the user's business profile.
- **Response**: `200 OK` or `404 Not Found`

### `PUT /api/business/profile`
Creates or updates the business profile (idempotent upsert).
- **Request Body**:
  ```json
  {
    "business_name": "Tandoori Studio",
    "category": "Restaurants, Cafés & Bakeries",
    "description": "Authentic North Indian cuisine in Indiranagar, Bangalore.",
    "contact_email": "care@tandooristudio.in",
    "contact_phone": "+91 98765 43210",
    "default_language": "en",
    "preferred_greeting": "Hi [Name],",
    "preferred_sign_off": "Warmly,\nThe Tandoori Studio Team"
  }
  ```

---

## 3. Voice Profile Endpoints

### `GET /api/voice/profile`
Retrieves the extracted voice profile.

### `PUT /api/voice/profile`
Updates tone, formality, length, greetings, sign-off, or preferred phrases.

### `POST /api/voice/examples`
Saves 3 to 5 example replies.

### `POST /api/voice/analyze`
Extracts a structured brand voice profile from example replies using AI inference.

---

## 4. Reviews & Generation Endpoints

### `POST /api/reviews`
Atomically validates quota, runs AI generation with prompt safety guardrails, saves review and draft records, and logs atomic usage event.
- **Request Body**:
  ```json
  {
    "review_text": "The mutton biryani was extraordinary! Loved the ambience.",
    "reviewer_name": "Arjun Sharma",
    "star_rating": 5,
    "response_language": "en"
  }
  ```
- **Response**: `201 Created`
  Returns `ReviewWithDraftsResponse` containing the review record, active draft, and version history.
- **Errors**: `429 Too Many Requests` if monthly limit is exhausted.

### `POST /api/reviews/{review_id}/drafts`
Regenerates an alternative reply variation for an existing review without overwriting prior versions.

### `PATCH /api/drafts/{draft_id}`
Updates draft text edits or changes status (`draft`, `edited`, `copied`, `published`).

### `GET /api/history`
Returns paginated, searchable, filterable reviews with active draft responses.
- Query Parameters: `search`, `rating`, `sentiment`, `status`, `sort`, `page`, `page_size`.

---

## 5. Usage & Account Endpoints

### `GET /api/usage`
Returns monthly quota summary (`used`, `remaining`, `monthly_limit`, `reset_date`).

### `DELETE /api/account`
Permanently deletes the user account, cascading deletion to all business data, voice settings, reviews, and drafts.
