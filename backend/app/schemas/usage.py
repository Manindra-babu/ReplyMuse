from pydantic import BaseModel
from typing import Optional


class UsageResponse(BaseModel):
    plan: str
    monthly_limit: int
    used: int
    remaining: int
    period_start: str
    reset_date: str
    is_quota_exhausted: bool
