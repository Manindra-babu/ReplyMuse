import math
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db, get_utc_now
from app.config import settings
from app.models.user import User
from app.models.business import BusinessProfile
from app.models.subscription import Subscription
from app.models.usage import UsageEvent
from app.api.deps import get_current_admin
from app.services.quota_service import QuotaService
from app.schemas.admin import (
    AdminMetricsResponse,
    AdminUserListItem,
    AdminUserListResponse,
    GrantCreditsRequest,
    UpdatePlanRequest,
    UpdateUserStatusRequest,
)

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get("/metrics", response_model=AdminMetricsResponse)
async def get_admin_metrics(
    admin: User = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    period_start, period_end = QuotaService.get_current_billing_period()

    # Total users
    stmt_total_users = select(func.count(User.id)).where(User.deleted_at.is_(None))
    total_users = (await session.execute(stmt_total_users)).scalar() or 0

    # Active users
    stmt_active_users = select(func.count(User.id)).where(
        User.deleted_at.is_(None), User.is_active == True
    )
    active_users = (await session.execute(stmt_active_users)).scalar() or 0

    # Total businesses
    stmt_businesses = select(func.count(BusinessProfile.id))
    total_businesses = (await session.execute(stmt_businesses)).scalar() or 0

    # Generations this month
    stmt_month_gen = select(func.coalesce(func.sum(UsageEvent.quantity), 0)).where(
        UsageEvent.event_type == "generation",
        UsageEvent.created_at >= period_start,
        UsageEvent.created_at < period_end,
    )
    month_generations = (await session.execute(stmt_month_gen)).scalar() or 0

    # Generations all time
    stmt_all_gen = select(func.coalesce(func.sum(UsageEvent.quantity), 0)).where(
        UsageEvent.event_type == "generation"
    )
    all_time_generations = (await session.execute(stmt_all_gen)).scalar() or 0

    # Plan distribution
    stmt_plans = select(Subscription.plan, func.count(Subscription.id)).group_by(Subscription.plan)
    plan_rows = (await session.execute(stmt_plans)).all()
    plan_dist: Dict[str, int] = {"free": 0, "growth": 0, "pro": 0}
    for plan, count in plan_rows:
        plan_dist[plan] = count

    return AdminMetricsResponse(
        total_users=total_users,
        active_users=active_users,
        total_businesses=total_businesses,
        total_generations_month=int(month_generations),
        total_generations_all_time=int(all_time_generations),
        plan_distribution=plan_dist,
    )


@router.get("/users", response_model=AdminUserListResponse)
async def list_users(
    search: Optional[str] = Query(default=None, description="Search by email or business name"),
    plan: Optional[str] = Query(default=None, description="Filter by subscription plan"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=15, ge=1, le=50),
    admin: User = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    period_start, period_end = QuotaService.get_current_billing_period()

    query = (
        select(User)
        .options(
            selectinload(User.business_profile),
            selectinload(User.subscription),
        )
        .where(User.deleted_at.is_(None))
    )

    if search:
        pattern = f"%{search.strip().lower()}%"
        query = query.outerjoin(BusinessProfile, User.id == BusinessProfile.user_id).where(
            User.email.ilike(pattern) | BusinessProfile.business_name.ilike(pattern)
        )

    if plan:
        query = query.join(Subscription, User.id == Subscription.user_id).where(
            Subscription.plan == plan.lower()
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await session.execute(count_query)).scalar() or 0
    total_pages = max(1, math.ceil(total / page_size))

    # Paginate
    offset = (page - 1) * page_size
    query = query.order_by(desc(User.created_at)).offset(offset).limit(page_size)
    users = (await session.execute(query)).scalars().all()

    # Build items with quota details
    items = []
    for u in users:
        biz_name = u.business_profile.business_name if u.business_profile else None
        biz_cat = u.business_profile.category if u.business_profile else None

        sub = u.subscription
        plan_name = sub.plan if sub else "free"
        base_limit = (
            sub.custom_monthly_limit
            if (sub and sub.custom_monthly_limit is not None)
            else settings.PLAN_LIMITS.get(plan_name, settings.MONTHLY_FREE_GENERATION_LIMIT)
        )
        bonus = sub.bonus_credits if sub else 0
        total_allowance = base_limit + bonus

        # Calculate month usage
        stmt_usage = (
            select(func.coalesce(func.sum(UsageEvent.quantity), 0))
            .where(
                UsageEvent.user_id == u.id,
                UsageEvent.event_type == "generation",
                UsageEvent.created_at >= period_start,
                UsageEvent.created_at < period_end,
            )
        )
        used = int((await session.execute(stmt_usage)).scalar() or 0)
        remaining = max(0, total_allowance - used)

        items.append(
            AdminUserListItem(
                id=u.id,
                email=u.email,
                is_active=u.is_active,
                is_admin=u.is_admin,
                created_at=u.created_at,
                business_name=biz_name,
                category=biz_cat,
                plan=plan_name,
                monthly_limit=base_limit,
                bonus_credits=bonus,
                used_month=used,
                remaining=remaining,
            )
        )

    return AdminUserListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/users/{user_id}/credits")
async def grant_credits(
    user_id: uuid.UUID,
    data: GrantCreditsRequest,
    admin: User = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Subscription)
        .where(Subscription.user_id == user_id)
    )
    sub = (await session.execute(stmt)).scalar_one_or_none()

    if not sub:
        sub = Subscription(
            id=uuid.uuid4(),
            user_id=user_id,
            plan="free",
            status="active",
            bonus_credits=data.bonus_credits,
            custom_monthly_limit=data.custom_monthly_limit,
            period_start=get_utc_now(),
        )
        session.add(sub)
    else:
        if data.bonus_credits > 0:
            sub.bonus_credits += data.bonus_credits
        if data.custom_monthly_limit is not None:
            sub.custom_monthly_limit = data.custom_monthly_limit

    await session.commit()
    await session.refresh(sub)

    return {
        "message": f"Successfully updated credits for user {user_id}",
        "bonus_credits": sub.bonus_credits,
        "custom_monthly_limit": sub.custom_monthly_limit,
        "plan": sub.plan,
    }


@router.put("/users/{user_id}/plan")
async def update_user_plan(
    user_id: uuid.UUID,
    data: UpdatePlanRequest,
    admin: User = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(Subscription).where(Subscription.user_id == user_id)
    sub = (await session.execute(stmt)).scalar_one_or_none()

    if not sub:
        sub = Subscription(
            id=uuid.uuid4(),
            user_id=user_id,
            plan=data.plan,
            status="active",
            period_start=get_utc_now(),
        )
        session.add(sub)
    else:
        sub.plan = data.plan

    await session.commit()
    await session.refresh(sub)

    return {
        "message": f"Plan updated to {data.plan}",
        "user_id": str(user_id),
        "plan": sub.plan,
    }


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: uuid.UUID,
    data: UpdateUserStatusRequest,
    admin: User = Depends(get_current_admin),
    session: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    user = (await session.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = data.is_active
    await session.commit()
    await session.refresh(user)

    return {
        "message": f"User status updated to {'active' if user.is_active else 'deactivated'}",
        "user_id": str(user.id),
        "is_active": user.is_active,
    }
