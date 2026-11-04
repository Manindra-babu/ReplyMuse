import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import DateTime, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID, get_utc_now

if TYPE_CHECKING:
    from app.models.business import BusinessProfile
    from app.models.usage import UsageEvent
    from app.models.subscription import Subscription


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Password reset support
    reset_token: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True
    )
    reset_token_expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Soft delete support
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
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
    business_profile: Mapped[Optional["BusinessProfile"]] = relationship(
        "BusinessProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    usage_events: Mapped[List["UsageEvent"]] = relationship(
        "UsageEvent", back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    subscription: Mapped[Optional["Subscription"]] = relationship(
        "Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
