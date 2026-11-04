import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, get_utc_now
from app.models.user import User
from app.models.business import BusinessProfile
from app.schemas.business import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    BusinessProfileResponse,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/business", tags=["Business Profile"])


@router.get("/profile", response_model=BusinessProfileResponse)
async def get_business_profile(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(BusinessProfile).where(BusinessProfile.user_id == user.id)
    profile = (await session.execute(stmt)).scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found.",
        )
    return profile


@router.put("/profile", response_model=BusinessProfileResponse)
async def update_or_create_business_profile(
    data: BusinessProfileCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(BusinessProfile).where(BusinessProfile.user_id == user.id)
    profile = (await session.execute(stmt)).scalar_one_or_none()

    if not profile:
        profile = BusinessProfile(
            id=uuid.uuid4(),
            user_id=user.id,
            business_name=data.business_name.strip(),
            category=data.category.strip(),
            description=data.description.strip(),
            contact_email=data.contact_email,
            contact_phone=data.contact_phone.strip() if data.contact_phone else None,
            default_language=data.default_language or "en",
            preferred_greeting=data.preferred_greeting.strip() if data.preferred_greeting else None,
            preferred_sign_off=data.preferred_sign_off.strip() if data.preferred_sign_off else None,
        )
        session.add(profile)
    else:
        profile.business_name = data.business_name.strip()
        profile.category = data.category.strip()
        profile.description = data.description.strip()
        profile.contact_email = data.contact_email
        profile.contact_phone = data.contact_phone.strip() if data.contact_phone else None
        profile.default_language = data.default_language or "en"
        profile.preferred_greeting = data.preferred_greeting.strip() if data.preferred_greeting else None
        profile.preferred_sign_off = data.preferred_sign_off.strip() if data.preferred_sign_off else None

    await session.commit()
    await session.refresh(profile)
    return profile
