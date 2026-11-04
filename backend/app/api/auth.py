import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db, get_utc_now
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    UserResponse,
    TokenResponse,
)
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_secure_token,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def build_user_response(user: User) -> UserResponse:
    has_business = user.business_profile is not None
    has_voice = False
    if has_business and user.business_profile.voice_profile is not None:
        has_voice = True

    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        email_verified=user.email_verified_at is not None,
        created_at=user.created_at,
        has_business_profile=has_business,
        has_voice_profile=has_voice,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
):
    # Check if user already exists
    email_clean = data.email.lower().strip()
    stmt = select(User).where(User.email == email_clean)
    existing_user = (await session.execute(stmt)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    user = User(
        id=uuid.uuid4(),
        email=email_clean,
        password_hash=get_password_hash(data.password),
        email_verified_at=get_utc_now(),  # Pre-verified for MVP onboarding convenience
        is_active=True,
    )
    session.add(user)

    # Initialize free subscription
    sub = Subscription(
        id=uuid.uuid4(),
        user_id=user.id,
        plan="free",
        status="active",
        period_start=get_utc_now(),
    )
    session.add(sub)
    await session.commit()
    await session.refresh(user)

    # Generate token
    token = create_access_token(str(user.id))
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_response(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
):
    email_clean = data.email.lower().strip()
    stmt = select(User).where(User.email == email_clean, User.deleted_at.is_(None))
    user = (await session.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support.",
        )

    # Issue access token
    token = create_access_token(str(user.id))
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )

    # Load business profile
    await session.refresh(user)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_response(user),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    data: GoogleAuthRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
):
    """
    Verifies Google ID Token via Google's tokeninfo endpoint,
    signs in existing user or automatically provisions a new account.
    """
    import httpx

    # Verify ID token with Google's public tokeninfo endpoint
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            tokeninfo_res = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": data.credential},
            )
            if tokeninfo_res.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Google authentication token.",
                )
            payload = tokeninfo_res.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication service is temporarily unreachable.",
        )

    # Optional Client ID verification if configured
    if settings.GOOGLE_CLIENT_ID:
        aud = payload.get("aud")
        if aud != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google token audience mismatch.",
            )

    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not return an email address.",
        )
    email_clean = email.lower().strip()

    # Find existing user by email
    stmt = select(User).where(User.email == email_clean)
    user = (await session.execute(stmt)).scalar_one_or_none()

    if not user:
        # Auto-provision new user account
        user = User(
            id=uuid.uuid4(),
            email=email_clean,
            password_hash=get_password_hash(generate_secure_token(32)),
            email_verified_at=get_utc_now(),
            is_active=True,
        )
        session.add(user)

        # Initialize free subscription
        sub = Subscription(
            id=uuid.uuid4(),
            user_id=user.id,
            plan="free",
            status="active",
            period_start=get_utc_now(),
        )
        session.add(sub)
        await session.commit()
        await session.refresh(user)
    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact support.",
            )
        # Update email_verified_at if not set
        if not user.email_verified_at:
            user.email_verified_at = get_utc_now()
            await session.commit()
            await session.refresh(user)

    # Issue access token
    token = create_access_token(str(user.id))
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=build_user_response(user),
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return build_user_response(user)


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_db),
):
    # Generic recovery response to prevent account enumeration
    email_clean = data.email.lower().strip()
    stmt = select(User).where(User.email == email_clean, User.deleted_at.is_(None))
    user = (await session.execute(stmt)).scalar_one_or_none()

    if user:
        reset_token = generate_secure_token()
        user.reset_token = reset_token
        user.reset_token_expires_at = get_utc_now() + timedelta(hours=2)
        await session.commit()
        # In production this emails the user; in local dev/testing we also return token if DEBUG is on
        return {
            "message": "If this email is registered, password reset instructions have been dispatched.",
            "dev_reset_token": reset_token if settings.DEBUG else None,
        }

    return {
        "message": "If this email is registered, password reset instructions have been dispatched."
    }


@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(
        User.reset_token == data.token,
        User.reset_token_expires_at > get_utc_now(),
        User.deleted_at.is_(None),
    )
    user = (await session.execute(stmt)).scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token is invalid or has expired.",
        )

    user.password_hash = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    await session.commit()

    return {"message": "Password has been successfully updated. You may now sign in."}


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    user.password_hash = get_password_hash(data.new_password)
    await session.commit()

    return {"message": "Password changed successfully."}
