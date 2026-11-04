import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_business_profile_crud(client: AsyncClient, auth_headers: dict):
    # Initially 404
    get_res = await client.get("/api/business/profile", headers=auth_headers)
    assert get_res.status_code == 404

    # Create business profile
    create_payload = {
        "business_name": "Lumière Dental Care",
        "category": "Dentists & Clinics",
        "description": "Comprehensive gentle family dentistry and cosmetic smile design in Bandra, Mumbai.",
        "contact_email": "care@lumieredental.in",
        "contact_phone": "+91 99887 76655",
        "default_language": "en",
        "preferred_greeting": "Dear [Name],",
        "preferred_sign_off": "Warm regards,\nDr. Mehta & The Lumière Dental Team",
    }
    put_res = await client.put(
        "/api/business/profile",
        headers=auth_headers,
        json=create_payload,
    )
    assert put_res.status_code == 200
    biz_data = put_res.json()
    assert biz_data["business_name"] == "Lumière Dental Care"
    assert biz_data["category"] == "Dentists & Clinics"

    # Get profile
    get_res2 = await client.get("/api/business/profile", headers=auth_headers)
    assert get_res2.status_code == 200
    assert get_res2.json()["contact_email"] == "care@lumieredental.in"

    # Update profile
    update_payload = {
        **create_payload,
        "business_name": "Lumière Advanced Dental Care",
    }
    put_res2 = await client.put(
        "/api/business/profile",
        headers=auth_headers,
        json=update_payload,
    )
    assert put_res2.status_code == 200
    assert put_res2.json()["business_name"] == "Lumière Advanced Dental Care"
