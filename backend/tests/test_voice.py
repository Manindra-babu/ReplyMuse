import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_voice_examples_and_analysis(client: AsyncClient, auth_headers: dict):
    # Setup business first
    await client.put(
        "/api/business/profile",
        headers=auth_headers,
        json={
            "business_name": "Urban Wellness Spa",
            "category": "Salons & Spas",
            "description": "Holistic Ayurvedic therapies and luxury wellness treatments.",
            "contact_email": "hello@urbanwellness.in",
            "default_language": "en",
        },
    )

    # Analyze voice with 3 examples
    examples = [
        "Thank you for taking time to share your feedback! We are thrilled our Ayurvedic massage left you feeling refreshed.",
        "We appreciate your lovely compliments on our therapist's care. Looking forward to welcoming you back for another calming session.",
        "Thank you for sharing your thoughts. We regret the aromatherapy room was colder than expected and will adjust our climate controls immediately.",
    ]
    analyze_res = await client.post(
        "/api/voice/analyze",
        headers=auth_headers,
        json={"examples": examples},
    )
    assert analyze_res.status_code == 200
    voice_data = analyze_res.json()
    assert "tone" in voice_data
    assert "formality" in voice_data
    assert "greeting" in voice_data
    assert "sign_off" in voice_data

    # List saved examples
    ex_list = await client.get("/api/voice/examples", headers=auth_headers)
    assert ex_list.status_code == 200
    assert len(ex_list.json()) == 3

    # Manual edit of voice profile
    update_res = await client.put(
        "/api/voice/profile",
        headers=auth_headers,
        json={
            "tone": "Warm, serene, mindful and gracious",
            "formality": "Polished & friendly",
            "preferred_length": "Balanced (2-4 sentences)",
            "greeting": "Namaste [Name],",
            "sign_off": "In wellness,\nThe Urban Wellness Team",
            "preferred_phrases": ["In wellness", "peaceful sanctuary"],
            "avoided_phrases": ["as per policy"],
            "first_person_style": "we",
            "language_preference": "en",
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["greeting"] == "Namaste [Name],"
