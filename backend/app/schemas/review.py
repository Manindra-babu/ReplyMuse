import uuid
import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


def sanitize_input_text(val: str) -> str:
    if not val:
        return ""
    # Strip null bytes and dangerous unprintable ASCII control characters (keeping \n, \r, \t)
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", val)
    # Normalize unicode whitespace
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    # Disallow script tags
    cleaned = re.sub(r"<\s*script[^>]*>[\s\S]*?<\s*/\s*script\s*>", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


class ReviewCreate(BaseModel):
    review_text: str = Field(min_length=3, max_length=2000, description="The customer review text (max 2000 chars)")
    reviewer_name: Optional[str] = Field(default=None, max_length=100, description="Optional name of reviewer")
    star_rating: Optional[int] = Field(default=None, ge=1, le=5, description="Star rating between 1 and 5")
    response_language: Optional[str] = Field(default=None, max_length=50)

    @field_validator("review_text")
    def validate_and_sanitize_review(cls, v: str) -> str:
        sanitized = sanitize_input_text(v)
        if len(sanitized) < 3:
            raise ValueError("Review text must contain at least 3 characters of readable text.")
        if len(sanitized) > 2000:
            raise ValueError("Review text exceeds maximum allowed length of 2000 characters.")
        return sanitized

    @field_validator("reviewer_name")
    def validate_and_sanitize_name(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        sanitized = sanitize_input_text(v)
        return sanitized[:100] if sanitized else None


class ReviewResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    review_text: str
    reviewer_name: Optional[str] = None
    star_rating: Optional[int] = None
    response_language: Optional[str] = None
    detected_sentiment: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
