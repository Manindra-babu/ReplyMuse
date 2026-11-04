import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Configure environment for testing
os.environ["ENVIRONMENT"] = "testing"
os.environ["DEBUG"] = "False"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///:memory:"
os.environ["AI_PROVIDER"] = "mock"
os.environ["SECRET_KEY"] = "test_super_secret_key_32_characters_minimum_for_security"
os.environ["MONTHLY_FREE_GENERATION_LIMIT"] = "10"

from app.database import Base, get_db
from app.main import app
from app.config import settings

from sqlalchemy.pool import StaticPool

# Test async engine
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def auth_headers(client: AsyncClient):
    """Registers and authenticates a test user, returning auth headers."""
    reg_res = await client.post(
        "/api/auth/register",
        json={"email": "owner@tandooristudio.com", "password": "Password123!"},
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def onboarded_client(client: AsyncClient, auth_headers: dict):
    """Provides client with registered user, business profile, and voice profile."""
    # 1. Setup business profile
    biz_res = await client.put(
        "/api/business/profile",
        headers=auth_headers,
        json={
            "business_name": "Tandoori Studio",
            "category": "Restaurant & Café",
            "description": "Authentic artisanal North Indian dining in Indiranagar, Bangalore. Famous for slow-cooked dal makhani and tandoor kebabs.",
            "contact_email": "care@tandooristudio.com",
            "contact_phone": "+91 98765 43210",
            "default_language": "en",
            "preferred_greeting": "Hi [Name],",
            "preferred_sign_off": "Warmly,\nThe Tandoori Studio Family",
        },
    )
    assert biz_res.status_code == 200

    # 2. Setup voice profile
    voice_res = await client.post(
        "/api/voice/analyze",
        headers=auth_headers,
        json={
            "examples": [
                "Thank you so much for the glowing review! Our chef takes immense pride in our slow-cooked dal makhani. We cannot wait to host you again soon!",
                "We truly appreciate your visit and thoughtful words. Delighted to hear you loved the tandoori broccoli and our hospitality. Warm regards!",
                "Thank you for sharing your feedback with us. We are genuinely sorry about the delay during peak dinner rush. Please email us at care@tandooristudio.com so we can make this right.",
            ]
        },
    )
    assert voice_res.status_code == 200
    return client, auth_headers
