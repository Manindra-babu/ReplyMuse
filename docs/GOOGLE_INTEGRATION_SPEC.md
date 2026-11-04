# Google Business Profile Integration Blueprint

## 1. Context & MVP Boundary

In ReplyMuse MVP (v1.0), Google integration is intentionally manual:
- Business owners copy reviews from Google Business Profile.
- Paste them into the ReplyMuse Review Composer.
- Review and edit the tailored draft.
- Copy back to Google in one click.

This architectural decision eliminates dependency on Google's stringent approval cycles, business verification delays, and OAuth token maintenance for the MVP launch.

---

## 2. Phase 2 Architecture: Direct Google API Integration

When ready to enable direct synchronization, the system will implement the following service boundary:

```
[ ReplyMuse Core ] <---> [ Google Service Boundary ] <---> [ Google Business Profile API ]
                                |
                                +-- Google OAuth2 Handler
                                +-- Location Account Sync Worker
                                +-- Webhook / Polling Review Importer
                                +-- Explicit Approval Publishing Queue
```

---

## 3. Required API Prerequisites & Permissions

1. **Google Cloud Project Setup**:
   - Access to **Google Business Profile APIs** (formerly Google My Business API).
   - Scopes required:
     - `https://www.googleapis.com/auth/business.manage` (Read and write reviews)
     - `openid`, `email`, `profile`

2. **Account Linking Workflow**:
   - Owner clicks "Connect Google Business Profile".
   - Redirect to Google OAuth consent screen.
   - Callback receives auth code; exchange for access token and refresh token.
   - Encrypt refresh token using AES-256-GCM before database persistence in a dedicated `google_integrations` table.

3. **Location Selection**:
   - A business account may contain multiple locations.
   - Present a location selection dropdown matching the business profile.
   - Store verified `location_name` and `account_id`.

4. **Review Synchronization**:
   - Support Pub/Sub notifications or hourly polling for new reviews.
   - Automatically ingest new reviews into the `reviews` table with `source="google_api"`.

5. **Explicit Human-in-the-Loop Publishing**:
   - **CRITICAL**: ReplyMuse will NEVER automatically publish replies without explicit approval.
   - The user reviews the draft inside ReplyMuse and clicks **"Approve & Post to Google"**.
   - The backend dispatches `locations.reviews.updateReply` via the Google Business Profile API.
   - Updates draft status to `published` with the external Google reply timestamp.

6. **Error Recovery & Token Revocation**:
   - Automatic refresh token rotation.
   - If Google revokes permissions (e.g. password change), mark integration as `disconnected` and notify the owner cleanly without disrupting manual copy-paste functionality.
