import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.business import BusinessProfile
from app.models.voice import VoiceProfile, VoiceExample
from app.services.ai.factory import get_ai_provider


class VoiceService:
    @staticmethod
    async def analyze_and_update_profile(
        session: AsyncSession,
        business: BusinessProfile,
        examples: List[str],
    ) -> VoiceProfile:
        ai_provider = get_ai_provider()
        analysis = await ai_provider.analyze_voice(
            business_name=business.business_name,
            category=business.category,
            description=business.description,
            examples=examples,
        )

        # Check if voice profile already exists
        stmt = select(VoiceProfile).where(VoiceProfile.business_id == business.id)
        voice_profile = (await session.execute(stmt)).scalar_one_or_none()

        if not voice_profile:
            voice_profile = VoiceProfile(
                id=uuid.uuid4(),
                business_id=business.id,
                tone=analysis.tone,
                formality=analysis.formality,
                preferred_length=analysis.preferred_length,
                greeting=analysis.greeting or business.preferred_greeting,
                sign_off=analysis.sign_off or business.preferred_sign_off,
                preferred_phrases=analysis.preferred_phrases,
                avoided_phrases=analysis.avoided_phrases,
                first_person_style=analysis.first_person_style,
                language_preference=analysis.language_preference,
            )
            session.add(voice_profile)
        else:
            voice_profile.tone = analysis.tone
            voice_profile.formality = analysis.formality
            voice_profile.preferred_length = analysis.preferred_length
            if analysis.greeting:
                voice_profile.greeting = analysis.greeting
            if analysis.sign_off:
                voice_profile.sign_off = analysis.sign_off
            voice_profile.preferred_phrases = analysis.preferred_phrases
            voice_profile.avoided_phrases = analysis.avoided_phrases
            voice_profile.first_person_style = analysis.first_person_style
            voice_profile.language_preference = analysis.language_preference

        await session.flush()
        return voice_profile
