import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, String, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, GUID, get_utc_now

if TYPE_CHECKING:
    from app.models.review import Review


class ReplyDraft(Base):
    __tablename__ = "reply_drafts"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4, index=True
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("reviews.id", ondelete="CASCADE"), index=True, nullable=False
    )
    model_provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    original_draft: Mapped[str] = mapped_column(Text, nullable=False)
    edited_reply: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="draft", nullable=False
    )  # draft, edited, copied, published
    safety_flags: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

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
    review: Mapped["Review"] = relationship("Review", back_populates="drafts")
