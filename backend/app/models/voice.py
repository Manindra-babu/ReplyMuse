import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import DateTime, String, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID, get_utc_now

if TYPE_CHECKING:
    from app.models.business import BusinessProfile


class VoiceProfile(Base):
    __tablename__ = "voice_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4, index=True
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("business_profiles.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    tone: Mapped[str] = mapped_column(String(255), default="Warm, appreciative, and professional", nullable=False)
    formality: Mapped[str] = mapped_column(String(100), default="Casual yet polished", nullable=False)
    preferred_length: Mapped[str] = mapped_column(String(100), default="Medium (2-4 sentences)", nullable=False)
    greeting: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sign_off: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preferred_phrases: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    avoided_phrases: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    first_person_style: Mapped[str] = mapped_column(String(50), default="we", nullable=False)  # "we" or "I"
    language_preference: Mapped[str] = mapped_column(String(50), default="en", nullable=False)

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
    business: Mapped["BusinessProfile"] = relationship("BusinessProfile", back_populates="voice_profile")


class VoiceExample(Base):
    __tablename__ = "voice_examples"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4, index=True
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("business_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    example_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=get_utc_now, nullable=False
    )

    # Relationships
    business: Mapped["BusinessProfile"] = relationship("BusinessProfile", back_populates="voice_examples")
