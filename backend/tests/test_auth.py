import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    # Registration
    reg_res = await client.post(
        "/api/auth/register",
        json={"email": "chef@bangalorebakes.com", "password": "SecurePassword123!"},
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "chef@bangalorebakes.com"

    # Duplicate registration fails
    dup_res = await client.post(
        "/api/auth/register",
        json={"email": "chef@bangalorebakes.com", "password": "AnotherPassword123!"},
    )
    assert dup_res.status_code == 409

    # Login
    login_res = await client.post(
        "/api/auth/login",
        json={"email": "chef@bangalorebakes.com", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Access /me
    me_res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "chef@bangalorebakes.com"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    res = await client.post(
        "/api/auth/login",
        json={"email": "nonexistent@replymuse.com", "password": "WrongPassword123!"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_rejects_unauthenticated(client: AsyncClient):
    res = await client.get("/api/auth/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_forgot_and_reset_password(client: AsyncClient):
    # Register user
    await client.post(
        "/api/auth/register",
        json={"email": "resetme@replymuse.com", "password": "OldPassword123!"},
    )

    # Forgot password
    forgot_res = await client.post(
        "/api/auth/forgot-password",
        json={"email": "resetme@replymuse.com"},
    )
    assert forgot_res.status_code == 200
    dev_token = forgot_res.json().get("dev_reset_token")

    # If dev token present in test environment, test reset
    if dev_token:
        reset_res = await client.post(
            "/api/auth/reset-password",
            json={"token": dev_token, "new_password": "NewSecurePassword456!"},
        )
        assert reset_res.status_code == 200

        # Login with old password fails
        old_login = await client.post(
            "/api/auth/login",
            json={"email": "resetme@replymuse.com", "password": "OldPassword123!"},
        )
        assert old_login.status_code == 401

        # Login with new password succeeds
        new_login = await client.post(
            "/api/auth/login",
            json={"email": "resetme@replymuse.com", "password": "NewSecurePassword456!"},
        )
        assert new_login.status_code == 200
