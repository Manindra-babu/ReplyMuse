import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import DateTime, String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID, get_utc_now

if TYPE_CHECKING:
    from app.models.business import BusinessProfile
    from app.models.draft import ReplyDraft


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4, index=True
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("business_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    review_text: Mapped[str] = mapped_column(Text, nullable=False)
    reviewer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    star_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    response_language: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    detected_sentiment: Mapped[str] = mapped_column(String(50), default="positive", nullable=False)  # positive, neutral, negative, sensitive

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=get_utc_now, nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    # Relationships
    business: Mapped["BusinessProfile"] = relationship("BusinessProfile", back_populates="reviews")
    drafts: Mapped[List["ReplyDraft"]] = relationship(
        "ReplyDraft", back_populates="review", cascade="all, delete-orphan", order_by="desc(ReplyDraft.created_at)", lazy="selectin"
    )
