from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.usage import UsageResponse
from app.services.quota_service import QuotaService
from app.api.deps import get_current_user

router = APIRouter(prefix="/usage", tags=["Usage & Quota"])


@router.get("", response_model=UsageResponse)
async def get_usage(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    usage_data = await QuotaService.get_usage_summary(session, user.id)
    return UsageResponse(**usage_data)
