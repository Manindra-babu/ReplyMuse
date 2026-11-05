import uuid
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.business import BusinessProfile
from app.models.voice import VoiceProfile
from app.models.review import Review
from app.models.draft import ReplyDraft
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.draft import DraftResponse, ReviewWithDraftsResponse
from app.api.deps import get_current_business
from app.services.quota_service import QuotaService
from app.services.ai.factory import get_ai_provider
from app.services.ai.mock_provider import MockAIProvider
from app.utils.rate_limit import generation_rate_limiter
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reviews", tags=["Reviews & Reply Generation"])


@router.post(
    "",
    response_model=ReviewWithDraftsResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_review_and_generate_reply(
    data: ReviewCreate,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    # 1. Enforce quota check first before external AI or rate consumption
    await QuotaService.assert_quota_available(
        session=session, user_id=business.user_id
    )

    # 2. Check per-user rate limit (10 requests/min per user)
    if settings.ENVIRONMENT != "testing":
        generation_rate_limiter.check(business.user_id)

    # 3. Retrieve voice profile or fallback
    stmt = select(VoiceProfile).where(VoiceProfile.business_id == business.id)
    voice_profile = (await session.execute(stmt)).scalar_one_or_none()
    voice_dict = {
        "tone": voice_profile.tone if voice_profile else "Warm, appreciative, and professional",
        "formality": voice_profile.formality if voice_profile else "Polished & friendly",
        "preferred_length": voice_profile.preferred_length if voice_profile else "Balanced (2-4 sentences)",
        "greeting": (voice_profile.greeting if voice_profile else business.preferred_greeting) or "Hello [Name],",
        "sign_off": (voice_profile.sign_off if voice_profile else business.preferred_sign_off) or f"Warmly,\nThe {business.business_name} Team",
        "preferred_phrases": voice_profile.preferred_phrases if voice_profile else [],
        "avoided_phrases": voice_profile.avoided_phrases if voice_profile else [],
        "first_person_style": voice_profile.first_person_style if voice_profile else "we",
        "language_preference": data.response_language or (voice_profile.language_preference if voice_profile else business.default_language),
    }

    # 3. Call AI provider
    ai_provider = get_ai_provider()
    try:
        gen_result = await ai_provider.generate_reply(
            business_name=business.business_name,
            category=business.category,
            description=business.description,
            contact_email=business.contact_email,
            contact_phone=business.contact_phone,
            voice_profile=voice_dict,
            review_text=data.review_text,
            star_rating=data.star_rating,
            reviewer_name=data.reviewer_name,
            language_override=data.response_language,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"AI generation failed: {exc}. Attempting fallback.", exc_info=True)
        try:
            fallback = MockAIProvider()
            gen_result = await fallback.generate_reply(
                business_name=business.business_name,
                category=business.category,
                description=business.description,
                contact_email=business.contact_email,
                contact_phone=business.contact_phone,
                voice_profile=voice_dict,
                review_text=data.review_text,
                star_rating=data.star_rating,
                reviewer_name=data.reviewer_name,
                language_override=data.response_language,
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI generation service is temporarily unavailable. Please try again shortly.",
            )

    # 4. Record quota only after successful AI generation
    await QuotaService.record_generation_quota(
        session=session, user_id=business.user_id
    )

    # 5. Save Review
    review = Review(
        id=uuid.uuid4(),
        business_id=business.id,
        review_text=data.review_text.strip(),
        reviewer_name=data.reviewer_name.strip() if data.reviewer_name else None,
        star_rating=data.star_rating,
        response_language=data.response_language or business.default_language,
        detected_sentiment=gen_result.sentiment,
    )
    session.add(review)

    # 6. Save Draft
    draft = ReplyDraft(
        id=uuid.uuid4(),
        review_id=review.id,
        model_provider=gen_result.model_provider,
        model_name=gen_result.model_name,
        original_draft=gen_result.reply,
        edited_reply=gen_result.reply,
        status="draft",
        safety_flags=gen_result.safety_flags.model_dump(),
    )
    session.add(draft)

    await session.commit()
    await session.refresh(review)
    await session.refresh(draft)

    return ReviewWithDraftsResponse(
        review=ReviewResponse.model_validate(review),
        active_draft=DraftResponse.model_validate(draft),
        draft_history=[DraftResponse.model_validate(draft)],
    )


@router.get("", response_model=List[ReviewResponse])
async def list_reviews(
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Review)
        .where(Review.business_id == business.id)
        .order_by(Review.created_at.desc())
    )
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{review_id}", response_model=ReviewWithDraftsResponse)
async def get_review_detail(
    review_id: uuid.UUID,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Review)
        .options(selectinload(Review.drafts))
        .where(Review.id == review_id, Review.business_id == business.id)
    )
    review = (await session.execute(stmt)).scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    drafts = review.drafts
    active_draft = drafts[0] if drafts else None
    if not active_draft:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No drafts found for this review")

    return ReviewWithDraftsResponse(
        review=ReviewResponse.model_validate(review),
        active_draft=DraftResponse.model_validate(active_draft),
        draft_history=[DraftResponse.model_validate(d) for d in drafts],
    )
