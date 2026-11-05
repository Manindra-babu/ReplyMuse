import uuid
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.business import BusinessProfile
from app.models.voice import VoiceProfile
from app.utils.security import decode_access_token

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    session: AsyncSession = Depends(get_db),
) -> User:
    token: Optional[str] = None
    if auth and auth.credentials:
        token = auth.credentials
    else:
        # Check cookie
        token = request.cookies.get(settings.COOKIE_NAME)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or token invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )

    stmt = (
        select(User)
        .options(
            selectinload(User.business_profile).selectinload(BusinessProfile.voice_profile)
        )
        .where(User.id == user_uuid, User.deleted_at.is_(None))
    )
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated",
        )

    return user


async def get_current_admin(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> User:
    admin_emails = [e.strip().lower() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
    is_admin = bool(user.is_admin or (user.email and user.email.lower() in admin_emails))

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Platform administrator credentials required.",
        )

    # Sync is_admin in db if designated by email configuration
    if not user.is_admin:
        user.is_admin = True
        await session.commit()
        await session.refresh(user)

    return user


async def get_current_business(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BusinessProfile:
    stmt = (
        select(BusinessProfile)
        .options(
            selectinload(BusinessProfile.voice_profile),
            selectinload(BusinessProfile.voice_examples),
        )
        .where(BusinessProfile.user_id == user.id)
    )
    result = await session.execute(stmt)
    business = result.scalar_one_or_none()

    if not business:
        # Gracefully auto-provision default business & voice profiles for seamless UX
        business = BusinessProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            business_name="My Business",
            category="Local Business",
            description="Providing exceptional quality and memorable customer experiences.",
            preferred_greeting="Hi [Name],",
            preferred_sign_off="Warmly, The Team",
            contact_email=user.email,
            default_language="en",
        )
        session.add(business)
        await session.flush()

        voice = VoiceProfile(
            id=uuid.uuid4(),
            business_id=business.id,
            tone="Friendly, warm, and authentic",
            formality="Polished & friendly",
            preferred_length="Balanced (2-4 sentences)",
            greeting="Hi [Name],",
            sign_off="Warmly, The Team",
            preferred_phrases=[],
            avoided_phrases=[],
            first_person_style="we",
            language_preference="en",
        )
        session.add(voice)
        await session.commit()

        # Reload with selectinload options
        stmt = (
            select(BusinessProfile)
            .options(
                selectinload(BusinessProfile.voice_profile),
                selectinload(BusinessProfile.voice_examples),
            )
            .where(BusinessProfile.id == business.id)
        )
        result = await session.execute(stmt)
        business = result.scalar_one()

    return business
