import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import DateTime, String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID, get_utc_now

if TYPE_CHECKING:
    from app.models.user import User


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    plan: Mapped[str] = mapped_column(String(50), default="free", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    bonus_credits: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    custom_monthly_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    provider_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    period_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=get_utc_now, nullable=False
    )
    period_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=get_utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscription")
