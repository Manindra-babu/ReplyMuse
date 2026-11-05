import uuid
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class AdminMetricsResponse(BaseModel):
    total_users: int
    active_users: int
    total_businesses: int
    total_generations_month: int
    total_generations_all_time: int
    plan_distribution: Dict[str, int]


class AdminUserListItem(BaseModel):
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    is_admin: bool
    created_at: datetime
    business_name: Optional[str] = None
    category: Optional[str] = None
    plan: str = "free"
    monthly_limit: int = 10
    bonus_credits: int = 0
    used_month: int = 0
    remaining: int = 10
    model_config = ConfigDict(from_attributes=True)


class AdminUserListResponse(BaseModel):
    items: List[AdminUserListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class GrantCreditsRequest(BaseModel):
    bonus_credits: int = Field(default=0, ge=0, le=5000, description="Additional one-off credits to add")
    custom_monthly_limit: Optional[int] = Field(default=None, ge=1, le=10000, description="Override monthly quota")


class UpdatePlanRequest(BaseModel):
    plan: str = Field(pattern="^(free|growth|pro)$", description="Target subscription plan")


class UpdateUserStatusRequest(BaseModel):
    is_active: bool
