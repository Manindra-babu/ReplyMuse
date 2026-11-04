import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.review import ReviewResponse, sanitize_input_text


class DraftCreateRequest(BaseModel):
    # Optional parameters for regeneration overrides
    language_override: Optional[str] = Field(default=None, max_length=50)


class DraftUpdateRequest(BaseModel):
    edited_reply: Optional[str] = Field(default=None, min_length=1, max_length=3000)
    status: Optional[str] = Field(default=None, description="'draft', 'edited', 'copied', 'published'")

    @field_validator("edited_reply")
    def validate_reply(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        sanitized = sanitize_input_text(v)
        if not sanitized:
            raise ValueError("Edited reply cannot be empty.")
        return sanitized


class DraftResponse(BaseModel):
    id: uuid.UUID
    review_id: uuid.UUID
    model_provider: str
    model_name: str
    original_draft: str
    edited_reply: str
    status: str
    safety_flags: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ReviewWithDraftsResponse(BaseModel):
    review: ReviewResponse
    active_draft: DraftResponse
    draft_history: List[DraftResponse] = Field(default_factory=list)
