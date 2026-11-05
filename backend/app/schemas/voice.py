import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class VoiceProfileBase(BaseModel):
    tone: str = Field(default="Friendly, warm, and authentic", min_length=3, max_length=255)
    formality: str = Field(default="Polished & friendly", min_length=2, max_length=100)
    preferred_length: str = Field(default="Balanced (2-4 sentences)", min_length=2, max_length=100)
    greeting: Optional[str] = Field(default=None, max_length=100)
    sign_off: Optional[str] = Field(default=None, max_length=100)
    preferred_phrases: List[str] = Field(default_factory=list)
    avoided_phrases: List[str] = Field(default_factory=list)
    first_person_style: str = Field(default="we", description="'we' or 'I'")
    language_preference: str = Field(default="en")


class VoiceProfileUpdate(BaseModel):
    tone: Optional[str] = Field(default="Friendly, warm, and authentic", min_length=3, max_length=255)
    formality: Optional[str] = Field(default="Polished & friendly", min_length=2, max_length=100)
    preferred_length: Optional[str] = Field(default="Balanced (2-4 sentences)", min_length=2, max_length=100)
    greeting: Optional[str] = Field(default=None, max_length=100)
    sign_off: Optional[str] = Field(default=None, max_length=100)
    preferred_phrases: Optional[List[str]] = Field(default_factory=list)
    avoided_phrases: Optional[List[str]] = Field(default_factory=list)
    first_person_style: Optional[str] = Field(default="we", description="'we' or 'I'")
    language_preference: Optional[str] = Field(default="en")


class VoiceProfileResponse(VoiceProfileBase):
    id: uuid.UUID
    business_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class VoiceExampleCreate(BaseModel):
    example_text: str = Field(min_length=10, max_length=3000)


class VoiceExampleBatchCreate(BaseModel):
    examples: List[str] = Field(min_length=1, max_length=10)


class VoiceExampleResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    example_text: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class VoiceAnalyzeRequest(BaseModel):
    examples: List[str] = Field(min_length=1, max_length=10)
