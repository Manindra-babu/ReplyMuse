from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class VoiceAnalysisResult(BaseModel):
    tone: str
    formality: str
    preferred_length: str
    greeting: Optional[str] = None
    sign_off: Optional[str] = None
    preferred_phrases: List[str] = Field(default_factory=list)
    avoided_phrases: List[str] = Field(default_factory=list)
    first_person_style: str = "we"
    language_preference: str = "en"


class SafetyFlags(BaseModel):
    is_sensitive: bool = False
    allegation_detected: bool = False
    private_channel_offered: bool = False
    summary: Optional[str] = None


class GenerationResult(BaseModel):
    reply: str
    sentiment: str  # positive, neutral, negative, sensitive
    safety_flags: SafetyFlags = Field(default_factory=SafetyFlags)
    model_provider: str
    model_name: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None


class BaseAIProvider(ABC):
    @abstractmethod
    async def analyze_voice(
        self,
        business_name: str,
        category: str,
        description: str,
        examples: List[str],
    ) -> VoiceAnalysisResult:
        """Analyzes example replies to extract a reusable voice profile."""
        pass

    @abstractmethod
    async def generate_reply(
        self,
        business_name: str,
        category: str,
        description: str,
        contact_email: Optional[str],
        contact_phone: Optional[str],
        voice_profile: Dict[str, Any],
        review_text: str,
        star_rating: Optional[int] = None,
        reviewer_name: Optional[str] = None,
        language_override: Optional[str] = None,
    ) -> GenerationResult:
        """Generates an authentic review reply matching the business voice profile."""
        pass
