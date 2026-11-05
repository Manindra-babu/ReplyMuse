from pydantic import BaseModel
from typing import Optional


class UsageResponse(BaseModel):
    plan: str
    monthly_limit: int
    bonus_credits: int = 0
    total_allowance: Optional[int] = None
    used: int
    remaining: int
    period_start: str
    reset_date: str
    is_quota_exhausted: bool
