import asyncio
import json
import logging
import re
from typing import List, Optional, Dict, Any
import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.services.ai.base import (
    BaseAIProvider,
    VoiceAnalysisResult,
    GenerationResult,
    SafetyFlags,
)
from app.services.ai.mock_provider import MockAIProvider
from app.utils.prompts import build_voice_analysis_prompt, build_reply_generation_prompt

logger = logging.getLogger(__name__)

TRANSIENT_STATUS_CODES = {429, 500, 502, 503, 504}


class GeminiAIProvider(BaseAIProvider):
    """
    Production Google Gemini API Provider with structured output validation,
    bounded retries, exponential backoff, and graceful error handling.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self.timeout = float(settings.AI_TIMEOUT_SECONDS)
        self.fallback_provider = MockAIProvider()

    def _extract_json_from_text(self, text: str) -> dict:
        """Strips markdown code fences and extracts raw JSON safely."""
        text = text.strip()
        # Remove ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if fence_match:
            text = fence_match.group(1).strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback: look for first { and last }
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                return json.loads(text[start : end + 1])
            raise

    async def _call_gemini_api(self, prompt: str) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }
        if self.api_key.startswith("AQ.") or self.api_key.startswith("ya29."):
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 1000,
                "responseMimeType": "application/json",
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
            except httpx.HTTPStatusError as http_err:
                # If 400 Bad Request due to responseMimeType, try payload without responseMimeType
                if http_err.response.status_code == 400:
                    payload["generationConfig"].pop("responseMimeType", None)
                    response = await client.post(url, headers=headers, json=payload)
                    response.raise_for_status()
                    data = response.json()
                else:
                    raise

            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No completion candidate returned by Gemini API")
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                raise ValueError("Empty candidate content parts from Gemini API")
            return parts[0].get("text", "")

    async def analyze_voice(
        self,
        business_name: str,
        category: str,
        description: str,
        examples: List[str],
    ) -> VoiceAnalysisResult:
        if not self.api_key:
            logger.warning("Gemini API key missing. Using fallback provider for voice analysis.")
            return await self.fallback_provider.analyze_voice(
                business_name, category, description, examples
            )

        prompt = build_voice_analysis_prompt(
            business_name, category, description, examples
        )

        for attempt in range(settings.AI_MAX_RETRIES + 1):
            try:
                raw_text = await self._call_gemini_api(prompt)
                parsed = self._extract_json_from_text(raw_text)
                return VoiceAnalysisResult(
                    tone=parsed.get("tone", "Warm and hospitable"),
                    formality=parsed.get("formality", "Polished & friendly"),
                    preferred_length=parsed.get("preferred_length", "Balanced (2-4 sentences)"),
                    greeting=parsed.get("greeting", "Hello [Name],"),
                    sign_off=parsed.get("sign_off", f"Warmly,\nThe {business_name} Team"),
                    preferred_phrases=parsed.get("preferred_phrases", []),
                    avoided_phrases=parsed.get("avoided_phrases", []),
                    first_person_style=parsed.get("first_person_style", "we"),
                    language_preference=parsed.get("language_preference", "en"),
                )
            except Exception as e:
                logger.warning(f"Gemini voice analysis attempt {attempt + 1} failed: {e}")
                if attempt < settings.AI_MAX_RETRIES:
                    await asyncio.sleep(0.5 * (2 ** attempt))
                else:
                    if settings.ENVIRONMENT == "production":
                        raise HTTPException(
                            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="The AI style analyzer is temporarily delayed. Please try again shortly.",
                        )
                    return await self.fallback_provider.analyze_voice(
                        business_name, category, description, examples
                    )

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
        if not self.api_key:
            logger.warning("Gemini API key missing. Using fallback provider for generation.")
            return await self.fallback_provider.generate_reply(
                business_name,
                category,
                description,
                contact_email,
                contact_phone,
                voice_profile,
                review_text,
                star_rating,
                reviewer_name,
                language_override,
            )

        prompt = build_reply_generation_prompt(
            business_name,
            category,
            description,
            contact_email,
            contact_phone,
            voice_profile,
            review_text,
            star_rating,
            reviewer_name,
            language_override,
        )

        for attempt in range(settings.AI_MAX_RETRIES + 1):
            try:
                raw_text = await self._call_gemini_api(prompt)
                parsed = self._extract_json_from_text(raw_text)

                safety_data = parsed.get("safety_flags", {})
                safety_flags = SafetyFlags(
                    is_sensitive=bool(safety_data.get("is_sensitive", False)),
                    allegation_detected=bool(safety_data.get("allegation_detected", False)),
                    private_channel_offered=bool(safety_data.get("private_channel_offered", False)),
                    summary=safety_data.get("summary"),
                )

                reply = parsed.get("reply", "").strip()
                sentiment = parsed.get("sentiment", "positive")

                return GenerationResult(
                    reply=reply,
                    sentiment=sentiment,
                    safety_flags=safety_flags,
                    model_provider="gemini",
                    model_name=self.model,
                )
            except Exception as e:
                logger.warning(f"Gemini generation attempt {attempt + 1} failed: {e}")
                if attempt < settings.AI_MAX_RETRIES:
                    await asyncio.sleep(0.5 * (2 ** attempt))
                else:
                    if settings.ENVIRONMENT == "production":
                        raise HTTPException(
                            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="The AI generation service is temporarily unavailable. Please try again shortly.",
                        )
                    return await self.fallback_provider.generate_reply(
                        business_name,
                        category,
                        description,
                        contact_email,
                        contact_phone,
                        voice_profile,
                        review_text,
                        star_rating,
                        reviewer_name,
                        language_override,
                    )
