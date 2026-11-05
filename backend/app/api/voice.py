import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, get_utc_now
from app.models.business import BusinessProfile
from app.models.voice import VoiceProfile, VoiceExample
from app.schemas.voice import (
    VoiceProfileUpdate,
    VoiceProfileResponse,
    VoiceExampleCreate,
    VoiceExampleBatchCreate,
    VoiceExampleResponse,
    VoiceAnalyzeRequest,
)
from app.api.deps import get_current_business
from app.services.voice_analyzer import VoiceService
from app.services.ai.factory import get_ai_provider

router = APIRouter(prefix="/voice", tags=["Voice Profile & Examples"])


@router.get("/profile", response_model=VoiceProfileResponse)
async def get_voice_profile(
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(VoiceProfile).where(VoiceProfile.business_id == business.id)
    profile = (await session.execute(stmt)).scalar_one_or_none()
    if not profile:
        profile = VoiceProfile(
            id=uuid.uuid4(),
            business_id=business.id,
            tone="Friendly, warm, and authentic",
            formality="Polished & friendly",
            preferred_length="Balanced (2-4 sentences)",
            greeting=business.preferred_greeting or "Hi [Name],",
            sign_off=business.preferred_sign_off or "Warmly, The Team",
            preferred_phrases=[],
            avoided_phrases=[],
            first_person_style="we",
            language_preference="en",
        )
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
    return profile


@router.put("/profile", response_model=VoiceProfileResponse)
async def update_voice_profile(
    data: VoiceProfileUpdate,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(VoiceProfile).where(VoiceProfile.business_id == business.id)
    profile = (await session.execute(stmt)).scalar_one_or_none()

    tone_val = (data.tone or "Friendly, warm, and authentic").strip()
    formality_val = (data.formality or "Polished & friendly").strip()
    length_val = (data.preferred_length or "Balanced (2-4 sentences)").strip()
    greeting_val = data.greeting.strip() if data.greeting else None
    sign_off_val = data.sign_off.strip() if data.sign_off else None
    phrases_val = data.preferred_phrases if data.preferred_phrases is not None else []
    avoided_val = data.avoided_phrases if data.avoided_phrases is not None else []
    first_person_val = data.first_person_style or "we"
    lang_val = data.language_preference or "en"

    if not profile:
        profile = VoiceProfile(
            id=uuid.uuid4(),
            business_id=business.id,
            tone=tone_val,
            formality=formality_val,
            preferred_length=length_val,
            greeting=greeting_val,
            sign_off=sign_off_val,
            preferred_phrases=phrases_val,
            avoided_phrases=avoided_val,
            first_person_style=first_person_val,
            language_preference=lang_val,
        )
        session.add(profile)
    else:
        profile.tone = tone_val
        profile.formality = formality_val
        profile.preferred_length = length_val
        profile.greeting = greeting_val
        profile.sign_off = sign_off_val
        profile.preferred_phrases = phrases_val
        profile.avoided_phrases = avoided_val
        profile.first_person_style = first_person_val
        profile.language_preference = lang_val

    await session.commit()
    await session.refresh(profile)
    return profile


@router.get("/examples", response_model=List[VoiceExampleResponse])
async def list_voice_examples(
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    stmt = (
        select(VoiceExample)
        .where(VoiceExample.business_id == business.id)
        .order_by(VoiceExample.created_at.asc())
    )
    result = await session.execute(stmt)
    return result.scalars().all()


@router.post("/examples", response_model=List[VoiceExampleResponse], status_code=status.HTTP_201_CREATED)
async def save_voice_examples(
    data: VoiceExampleBatchCreate,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    # Clear old examples if replacing, or append
    valid_examples = [ex.strip() for ex in data.examples if len(ex.strip()) >= 5]
    if len(valid_examples) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least one valid example reply.",
        )

    # Delete existing examples for clean sync
    await session.execute(delete(VoiceExample).where(VoiceExample.business_id == business.id))

    new_examples = []
    for text in valid_examples:
        example = VoiceExample(
            id=uuid.uuid4(),
            business_id=business.id,
            example_text=text,
        )
        session.add(example)
        new_examples.append(example)

    await session.commit()
    for ex in new_examples:
        await session.refresh(ex)

    return new_examples


@router.delete("/examples/{example_id}")
async def delete_voice_example(
    example_id: uuid.UUID,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(VoiceExample).where(
        VoiceExample.id == example_id, VoiceExample.business_id == business.id
    )
    example = (await session.execute(stmt)).scalar_one_or_none()
    if not example:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Example not found")

    await session.delete(example)
    await session.commit()
    return {"message": "Example deleted successfully"}


@router.post("/analyze", response_model=VoiceProfileResponse)
async def analyze_voice(
    data: VoiceAnalyzeRequest,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    cleaned = [e.strip() for e in data.examples if len(e.strip()) >= 5]
    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one example reply (preferably 3 to 5) is required to analyze your tone.",
        )

    # Persist examples
    await session.execute(delete(VoiceExample).where(VoiceExample.business_id == business.id))
    for text in cleaned:
        session.add(
            VoiceExample(
                id=uuid.uuid4(),
                business_id=business.id,
                example_text=text,
            )
        )

    # Extract reusable voice profile using AI service
    voice_profile = await VoiceService.analyze_and_update_profile(
        session=session, business=business, examples=cleaned
    )
    await session.commit()
    await session.refresh(voice_profile)

    return voice_profile
