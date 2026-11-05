import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.business import BusinessProfile
from app.models.voice import VoiceProfile
from app.models.review import Review
from app.models.draft import ReplyDraft
from app.schemas.review import ReviewResponse
from app.schemas.draft import (
    DraftCreateRequest,
    DraftUpdateRequest,
    DraftResponse,
    ReviewWithDraftsResponse,
)
from app.api.deps import get_current_business
from app.services.quota_service import QuotaService
from app.services.ai.factory import get_ai_provider
from app.services.ai.mock_provider import MockAIProvider
from app.utils.rate_limit import generation_rate_limiter
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Drafts"])


@router.post(
    "/reviews/{review_id}/drafts",
    response_model=ReviewWithDraftsResponse,
    status_code=status.HTTP_201_CREATED,
)
async def regenerate_reply_draft(
    review_id: uuid.UUID,
    data: DraftCreateRequest,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    # Verify review belongs to this business
    stmt = (
        select(Review)
        .options(selectinload(Review.drafts))
        .where(Review.id == review_id, Review.business_id == business.id)
    )
    review = (await session.execute(stmt)).scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    # 1. Enforce quota check before AI generation (does NOT consume quota yet)
    await QuotaService.assert_quota_available(
        session=session, user_id=business.user_id
    )

    # 2. Check per-user rate limit (10 requests/min per user)
    if settings.ENVIRONMENT != "testing":
        generation_rate_limiter.check(business.user_id)

    # 3. Retrieve voice profile or fallback
    stmt_voice = select(VoiceProfile).where(VoiceProfile.business_id == business.id)
    voice_profile = (await session.execute(stmt_voice)).scalar_one_or_none()
    voice_dict = {
        "tone": voice_profile.tone if voice_profile else "Warm, appreciative, and professional",
        "formality": voice_profile.formality if voice_profile else "Polished & friendly",
        "preferred_length": voice_profile.preferred_length if voice_profile else "Balanced (2-4 sentences)",
        "greeting": (voice_profile.greeting if voice_profile else business.preferred_greeting) or "Hello [Name],",
        "sign_off": (voice_profile.sign_off if voice_profile else business.preferred_sign_off) or f"Warmly,\nThe {business.business_name} Team",
        "preferred_phrases": voice_profile.preferred_phrases if voice_profile else [],
        "avoided_phrases": voice_profile.avoided_phrases if voice_profile else [],
        "first_person_style": voice_profile.first_person_style if voice_profile else "we",
        "language_preference": data.language_override or (voice_profile.language_preference if voice_profile else business.default_language),
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
            review_text=review.review_text,
            star_rating=review.star_rating,
            reviewer_name=review.reviewer_name,
            language_override=data.language_override or review.response_language,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"AI draft regeneration failed: {exc}. Attempting fallback.", exc_info=True)
        try:
            fallback = MockAIProvider()
            gen_result = await fallback.generate_reply(
                business_name=business.business_name,
                category=business.category,
                description=business.description,
                contact_email=business.contact_email,
                contact_phone=business.contact_phone,
                voice_profile=voice_dict,
                review_text=review.review_text,
                star_rating=review.star_rating,
                reviewer_name=review.reviewer_name,
                language_override=data.language_override or review.response_language,
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

    # 5. Save new draft version
    new_draft = ReplyDraft(
        id=uuid.uuid4(),
        review_id=review.id,
        model_provider=gen_result.model_provider,
        model_name=gen_result.model_name,
        original_draft=gen_result.reply,
        edited_reply=gen_result.reply,
        status="draft",
        safety_flags=gen_result.safety_flags.model_dump(),
    )
    session.add(new_draft)
    await session.commit()

    # Re-fetch review and all drafts
    stmt_drafts = (
        select(ReplyDraft)
        .where(ReplyDraft.review_id == review.id)
        .order_by(ReplyDraft.created_at.desc())
    )
    all_drafts = (await session.execute(stmt_drafts)).scalars().all()

    return ReviewWithDraftsResponse(
        review=ReviewResponse.model_validate(review),
        active_draft=DraftResponse.model_validate(new_draft),
        draft_history=[DraftResponse.model_validate(d) for d in all_drafts],
    )


@router.patch("/drafts/{draft_id}", response_model=DraftResponse)
async def update_reply_draft(
    draft_id: uuid.UUID,
    data: DraftUpdateRequest,
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    # Verify draft belongs to user's business
    stmt = (
        select(ReplyDraft)
        .join(Review, ReplyDraft.review_id == Review.id)
        .where(ReplyDraft.id == draft_id, Review.business_id == business.id)
    )
    draft = (await session.execute(stmt)).scalar_one_or_none()
    if not draft:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found")

    if data.edited_reply is not None:
        draft.edited_reply = data.edited_reply
        if draft.status == "draft":
            draft.status = "edited"

    if data.status is not None:
        allowed = {"draft", "edited", "copied", "published"}
        if data.status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{data.status}'. Must be one of {allowed}",
            )
        draft.status = data.status

    await session.commit()
    await session.refresh(draft)
    return draft
