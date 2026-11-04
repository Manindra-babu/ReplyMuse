import time
from collections import defaultdict
from typing import Dict, List
import uuid
from fastapi import HTTPException, status, Depends
from app.models.user import User
from app.api.deps import get_current_user


class SlidingWindowRateLimiter:
    """
    In-memory thread-safe sliding window rate limiter per user.
    Tracks timestamps of requests within a rolling window.
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._user_timestamps: Dict[uuid.UUID, List[float]] = defaultdict(list)

    def check(self, user_id: uuid.UUID) -> None:
        now = time.time()
        cutoff = now - self.window_seconds

        # Clean old timestamps
        timestamps = self._user_timestamps[user_id]
        self._user_timestamps[user_id] = [t for t in timestamps if t > cutoff]

        if len(self._user_timestamps[user_id]) >= self.max_requests:
            oldest_active = self._user_timestamps[user_id][0]
            retry_after = max(1, int(self.window_seconds - (now - oldest_active)))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many generation requests. Please wait a moment before trying again.",
                headers={"Retry-After": str(retry_after)},
            )

        self._user_timestamps[user_id].append(now)


# Global rate limiter instance for reply generation endpoints: 10 requests / 60 seconds
generation_rate_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)


async def check_generation_rate_limit(user: User = Depends(get_current_user)) -> None:
    """
    FastAPI dependency that enforces 10 generations per minute per authenticated user.
    """
    generation_rate_limiter.check(user.id)
