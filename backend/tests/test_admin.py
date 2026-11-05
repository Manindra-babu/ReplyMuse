import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_non_admin_forbidden_from_admin_endpoints(client: AsyncClient, auth_headers: dict):
    # Non-admin user gets 403 Forbidden
    res = await client.get("/api/admin/metrics", headers=auth_headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]


@pytest.mark.asyncio
async def test_admin_portal_flow(client: AsyncClient):
    # 1. Register an admin user (matches ADMIN_EMAILS in settings)
    reg_res = await client.post(
        "/api/auth/register",
        json={"email": "manindrachowdhary1715@gmail.com", "password": "Password123!"},
    )
    assert reg_res.status_code == 201
    admin_token = reg_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register a standard user
    reg_user = await client.post(
        "/api/auth/register",
        json={"email": "cafe.owner@bangalore.in", "password": "Password123!"},
    )
    assert reg_user.status_code == 201
    user_id = reg_user.json()["user"]["id"]
    user_token = reg_user.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 3. Admin gets metrics
    metrics_res = await client.get("/api/admin/metrics", headers=admin_headers)
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["total_users"] >= 2
    assert "free" in metrics["plan_distribution"]

    # 4. Admin lists users
    users_res = await client.get("/api/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    user_list = users_res.json()
    assert user_list["total"] >= 2

    # 5. Check standard user's initial quota
    usage_res1 = await client.get("/api/usage", headers=user_headers)
    assert usage_res1.status_code == 200
    assert usage_res1.json()["monthly_limit"] == 10
    assert usage_res1.json()["remaining"] == 10

    # 6. Admin grants +25 bonus credits to standard user
    grant_res = await client.post(
        f"/api/admin/users/{user_id}/credits",
        headers=admin_headers,
        json={"bonus_credits": 25},
    )
    assert grant_res.status_code == 200
    assert grant_res.json()["bonus_credits"] == 25

    # 7. Standard user's quota now reflects bonus credits
    usage_res2 = await client.get("/api/usage", headers=user_headers)
    assert usage_res2.status_code == 200
    assert usage_res2.json()["bonus_credits"] == 25
    assert usage_res2.json()["remaining"] == 35  # 10 + 25

    # 8. Admin upgrades user to "growth" plan
    plan_res = await client.put(
        f"/api/admin/users/{user_id}/plan",
        headers=admin_headers,
        json={"plan": "growth"},
    )
    assert plan_res.status_code == 200
    assert plan_res.json()["plan"] == "growth"

    # 9. Standard user's quota now reflects Growth tier (100) + bonus (25) = 125
    usage_res3 = await client.get("/api/usage", headers=user_headers)
    assert usage_res3.status_code == 200
    assert usage_res3.json()["plan"] == "growth"
    assert usage_res3.json()["monthly_limit"] == 100
    assert usage_res3.json()["remaining"] == 125
