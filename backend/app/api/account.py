from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/account", tags=["Account Management"])


@router.delete("", status_code=status.HTTP_200_OK)
async def delete_account(
    response: Response,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Deletes the current user and cascades deletion to their business profile,
    voice profile, voice examples, reviews, drafts, and usage records.
    """
    await session.delete(user)
    await session.commit()

    # Clear session cookie
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )

    return {
        "message": "Your account and all associated business data, reviews, and drafts have been permanently deleted."
    }
