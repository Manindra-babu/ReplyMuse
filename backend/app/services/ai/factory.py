from app.config import settings
from app.services.ai.base import BaseAIProvider
from app.services.ai.gemini_provider import GeminiAIProvider
from app.services.ai.mock_provider import MockAIProvider


def get_ai_provider() -> BaseAIProvider:
    """Factory to retrieve configured AI provider."""
    provider_name = settings.AI_PROVIDER.lower()
    if provider_name == "gemini" and settings.GEMINI_API_KEY:
        return GeminiAIProvider()
    elif provider_name == "gemini":
        # Gemini requested but key not yet configured -> GeminiProvider with automatic graceful fallback
        return GeminiAIProvider()
    else:
        return MockAIProvider()
