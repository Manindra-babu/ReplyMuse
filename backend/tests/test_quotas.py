import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_monthly_quota_enforcement(onboarded_client):
    client, headers = onboarded_client

    # Check initial usage
    usage_res = await client.get("/api/usage", headers=headers)
    assert usage_res.status_code == 200
    usage_data = usage_res.json()
    assert usage_data["used"] == 0
    assert usage_data["remaining"] == 10
    assert usage_data["is_quota_exhausted"] is False

    # Consume all 10 generations
    for i in range(10):
        gen_res = await client.post(
            "/api/reviews",
            headers=headers,
            json={"review_text": f"Review number {i+1} delicious food and great service!"},
        )
        assert gen_res.status_code == 201

    # Verify usage is now exhausted
    usage_res2 = await client.get("/api/usage", headers=headers)
    assert usage_res2.json()["used"] == 10
    assert usage_res2.json()["remaining"] == 0
    assert usage_res2.json()["is_quota_exhausted"] is True

    # 11th attempt must fail with 429 Too Many Requests
    excess_res = await client.post(
        "/api/reviews",
        headers=headers,
        json={"review_text": "Review number 11 should be rejected due to quota limit"},
    )
    assert excess_res.status_code == 429
    error_detail = excess_res.json()["detail"]
    assert "quota" in str(error_detail).lower()
