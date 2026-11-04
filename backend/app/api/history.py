import math
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.business import BusinessProfile
from app.models.review import Review
from app.models.draft import ReplyDraft
from app.schemas.history import PaginatedHistoryResponse, HistoryItemResponse
from app.schemas.draft import DraftResponse
from app.api.deps import get_current_business

router = APIRouter(prefix="/history", tags=["Review History"])


@router.get("", response_model=PaginatedHistoryResponse)
async def get_review_history(
    search: Optional[str] = Query(default=None, description="Search review text or reviewer name"),
    rating: Optional[int] = Query(default=None, ge=1, le=5, description="Filter by star rating"),
    sentiment: Optional[str] = Query(default=None, description="Filter by sentiment (positive, neutral, negative, sensitive)"),
    status: Optional[str] = Query(default=None, description="Filter by latest draft status (draft, edited, copied, published)"),
    sort: str = Query(default="newest", pattern="^(newest|oldest)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    business: BusinessProfile = Depends(get_current_business),
    session: AsyncSession = Depends(get_db),
):
    query = select(Review).where(Review.business_id == business.id)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.where(
            (Review.review_text.ilike(search_pattern))
            | (Review.reviewer_name.ilike(search_pattern))
        )

    if rating is not None:
        query = query.where(Review.star_rating == rating)

    if sentiment:
        query = query.where(Review.detected_sentiment == sentiment.lower())

    if status:
        query = query.join(ReplyDraft, Review.id == ReplyDraft.review_id).where(
            ReplyDraft.status == status.lower()
        )

    # Count total matching
    count_stmt = select(func.count(func.distinct(Review.id))).select_from(query.subquery())
    total_result = await session.execute(count_stmt)
    total = total_result.scalar() or 0

    # Sort
    if sort == "oldest":
        query = query.order_by(asc(Review.created_at))
    else:
        query = query.order_by(desc(Review.created_at))

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).options(selectinload(Review.drafts))

    reviews_result = await session.execute(query)
    reviews = reviews_result.scalars().all()

    items = []
    for r in reviews:
        drafts = r.drafts
        active_draft = drafts[0] if drafts else None
        items.append(
            HistoryItemResponse(
                id=r.id,
                business_id=r.business_id,
                review_text=r.review_text,
                reviewer_name=r.reviewer_name,
                star_rating=r.star_rating,
                response_language=r.response_language,
                detected_sentiment=r.detected_sentiment,
                created_at=r.created_at,
                updated_at=r.updated_at,
                active_draft=DraftResponse.model_validate(active_draft) if active_draft else None,
                total_drafts_count=len(drafts),
            )
        )

    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return PaginatedHistoryResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
