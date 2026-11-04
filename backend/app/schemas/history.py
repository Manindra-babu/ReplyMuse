import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.draft import DraftResponse


class HistoryItemResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    review_text: str
    reviewer_name: Optional[str] = None
    star_rating: Optional[int] = None
    response_language: Optional[str] = None
    detected_sentiment: str
    created_at: datetime
    updated_at: datetime
    active_draft: Optional[DraftResponse] = None
    total_drafts_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class PaginatedHistoryResponse(BaseModel):
    items: List[HistoryItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
