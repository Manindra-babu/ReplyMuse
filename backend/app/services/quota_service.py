import uuid
from datetime import datetime, timezone, timedelta
from typing import Tuple, Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.config import settings
from app.models.usage import UsageEvent
from app.models.user import User


class QuotaService:
    @staticmethod
    def get_current_billing_period() -> Tuple[datetime, datetime]:
        """Calculates start of current calendar month (UTC) and reset date (1st of next month)."""
        now = datetime.now(timezone.utc)
        period_start = datetime(now.year, now.month, 1, 0, 0, 0, tzinfo=timezone.utc)

        # Calculate next month start
        if now.month == 12:
            period_end = datetime(now.year + 1, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        else:
            period_end = datetime(now.year, now.month + 1, 1, 0, 0, 0, tzinfo=timezone.utc)

        return period_start, period_end

    @staticmethod
    async def get_usage_summary(session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        """Returns the user's monthly generation limit, count used, count remaining, and reset date."""
        period_start, period_end = QuotaService.get_current_billing_period()
        limit = settings.MONTHLY_FREE_GENERATION_LIMIT

        stmt = (
            select(func.coalesce(func.sum(UsageEvent.quantity), 0))
            .where(
                UsageEvent.user_id == user_id,
                UsageEvent.event_type == "generation",
                UsageEvent.created_at >= period_start,
                UsageEvent.created_at < period_end,
            )
        )
        result = await session.execute(stmt)
        used = int(result.scalar() or 0)
        remaining = max(0, limit - used)

        return {
            "plan": "free",
            "monthly_limit": limit,
            "used": used,
            "remaining": remaining,
            "period_start": period_start.isoformat(),
            "reset_date": period_end.isoformat(),
            "is_quota_exhausted": remaining <= 0,
        }

    @staticmethod
    async def assert_quota_available(
        session: AsyncSession,
        user_id: uuid.UUID,
        idempotency_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validates that the user has available generation quota in this billing period.
        Raises 429 TOO MANY REQUESTS if exhausted. Does NOT consume quota.
        """
        if idempotency_key:
            stmt_idemp = select(UsageEvent).where(
                UsageEvent.user_id == user_id,
                UsageEvent.idempotency_key == idempotency_key,
            )
            existing = (await session.execute(stmt_idemp)).scalar_one_or_none()
            if existing:
                return {
                    "plan": "free",
                    "idempotent": True,
                    "is_quota_exhausted": False,
                }

        usage = await QuotaService.get_usage_summary(session, user_id)
        if usage["is_quota_exhausted"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Monthly generation quota reached",
                    "message": (
                        f"You have used all {usage['monthly_limit']} free replies for this billing period. "
                        f"Your monthly quota resets on {usage['reset_date'][:10]}."
                    ),
                    "used": usage["used"],
                    "limit": usage["monthly_limit"],
                    "reset_date": usage["reset_date"],
                },
            )
        return usage

    @staticmethod
    async def record_generation_quota(
        session: AsyncSession,
        user_id: uuid.UUID,
        idempotency_key: Optional[str] = None,
    ) -> UsageEvent:
        """
        Records a quota generation event only after successful generation.
        """
        if idempotency_key:
            stmt_idemp = select(UsageEvent).where(
                UsageEvent.user_id == user_id,
                UsageEvent.idempotency_key == idempotency_key,
            )
            existing = (await session.execute(stmt_idemp)).scalar_one_or_none()
            if existing:
                return existing

        event = UsageEvent(
            id=uuid.uuid4(),
            user_id=user_id,
            event_type="generation",
            quantity=1,
            idempotency_key=idempotency_key,
            created_at=datetime.now(timezone.utc),
        )
        session.add(event)
        await session.flush()
        return event

    @staticmethod
    async def assert_and_record_generation_quota(
        session: AsyncSession,
        user_id: uuid.UUID,
        idempotency_key: Optional[str] = None,
    ) -> UsageEvent:
        """
        Atomically checks remaining quota and logs usage event within the current session transaction.
        Raises 429 if quota is exhausted.
        """
        await QuotaService.assert_quota_available(session, user_id, idempotency_key)
        return await QuotaService.record_generation_quota(session, user_id, idempotency_key)
