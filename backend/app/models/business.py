import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import DateTime, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID, get_utc_now

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.voice import VoiceProfile, VoiceExample
    from app.models.review import Review


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    default_language: Mapped[str] = mapped_column(String(20), default="en", nullable=False)
    preferred_greeting: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preferred_sign_off: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

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
    user: Mapped["User"] = relationship("User", back_populates="business_profile")
    voice_profile: Mapped[Optional["VoiceProfile"]] = relationship(
        "VoiceProfile", back_populates="business", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    voice_examples: Mapped[List["VoiceExample"]] = relationship(
        "VoiceExample", back_populates="business", cascade="all, delete-orphan", lazy="selectin"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review", back_populates="business", cascade="all, delete-orphan", lazy="selectin"
    )
