import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class BusinessProfileBase(BaseModel):
    business_name: str = Field(min_length=2, max_length=255)
    category: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10, max_length=2000)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(default=None, max_length=50)
    default_language: str = Field(default="en", max_length=20)
    preferred_greeting: Optional[str] = Field(default=None, max_length=100)
    preferred_sign_off: Optional[str] = Field(default=None, max_length=100)


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    category: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, min_length=10, max_length=2000)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(default=None, max_length=50)
    default_language: Optional[str] = Field(default=None, max_length=20)
    preferred_greeting: Optional[str] = Field(default=None, max_length=100)
    preferred_sign_off: Optional[str] = Field(default=None, max_length=100)


class BusinessProfileResponse(BusinessProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
