import pytest
import uuid
from httpx import AsyncClient
from unittest.mock import patch
from app.utils.rate_limit import SlidingWindowRateLimiter
from app.services.quota_service import QuotaService


@pytest.mark.asyncio
async def test_health_endpoints(client: AsyncClient):
    """Verify both /health and /api/health return 200 healthy status."""
    res1 = await client.get("/health")
    assert res1.status_code == 200
    assert res1.json()["status"] == "healthy"

    res2 = await client.get("/api/health")
    assert res2.status_code == 200
    assert res2.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_auth_guards_protected_endpoints(client: AsyncClient):
    """Verify protected endpoints strictly reject unauthenticated requests with 401."""
    endpoints = [
        ("GET", "/api/reviews"),
        ("POST", "/api/reviews"),
        ("GET", "/api/history"),
        ("GET", "/api/business/profile"),
        ("GET", "/api/voice/profile"),
        ("GET", "/api/usage"),
    ]

    for method, path in endpoints:
        if method == "GET":
            res = await client.get(path)
        else:
            res = await client.post(path, json={})
        assert res.status_code == 401, f"Expected 401 for unauthenticated {method} {path}, got {res.status_code}"


@pytest.mark.asyncio
async def test_input_validation_review_length(onboarded_client):
    """Verify input validation rejects review_text longer than 2000 chars or under 3 chars."""
    client, headers = onboarded_client

    # Too short (< 3 chars)
    short_res = await client.post(
        "/api/reviews",
        headers=headers,
        json={"review_text": "hi"},
    )
    assert short_res.status_code == 422

    # Empty / whitespace only
    empty_res = await client.post(
        "/api/reviews",
        headers=headers,
        json={"review_text": "   "},
    )
    assert empty_res.status_code == 422

    # Too long (> 2000 chars)
    long_res = await client.post(
        "/api/reviews",
        headers=headers,
        json={"review_text": "a" * 2005},
    )
    assert long_res.status_code == 422


@pytest.mark.asyncio
async def test_quota_not_consumed_on_ai_failure(onboarded_client, db_session):
    """Verify quota is NOT consumed when an AI call fails or raises an error."""
    client, headers = onboarded_client

    # Initial quota check
    initial_usage = await client.get("/api/usage", headers=headers)
    assert initial_usage.status_code == 200
    used_before = initial_usage.json()["used"]

    # Mock AI provider to raise an exception simulating an external service timeout/failure
    with patch("app.services.ai.mock_provider.MockAIProvider.generate_reply", side_effect=RuntimeError("AI Timeout")):
        res = await client.post(
            "/api/reviews",
            headers=headers,
            json={"review_text": "This should fail because of AI error"},
        )
        # Should result in 500 or error
        assert res.status_code in [500, 503]

    # Verify quota counter was NOT incremented
    after_usage = await client.get("/api/usage", headers=headers)
    assert after_usage.json()["used"] == used_before


def test_sliding_window_rate_limiter():
    """Verify SlidingWindowRateLimiter blocks requests exceeding threshold."""
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=60)
    user_id = uuid.uuid4()

    # First 3 requests succeed
    limiter.check(user_id)
    limiter.check(user_id)
    limiter.check(user_id)

    # 4th request must raise HTTPException 429
    with pytest.raises(Exception) as excinfo:
        limiter.check(user_id)
    assert "Too many generation requests" in str(excinfo.value.detail)
    assert excinfo.value.status_code == 429
