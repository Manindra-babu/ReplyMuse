import re
from typing import List, Optional, Dict, Any
from app.services.ai.base import BaseAIProvider, VoiceAnalysisResult, GenerationResult, SafetyFlags


class MockAIProvider(BaseAIProvider):
    """
    High-fidelity deterministic AI provider used for testing and offline development.
    Respects business context, voice profiles, star ratings, and safety constraints.
    """

    async def analyze_voice(
        self,
        business_name: str,
        category: str,
        description: str,
        examples: List[str],
    ) -> VoiceAnalysisResult:
        full_text = " ".join(examples).lower()
        
        # Analyze first person perspective
        first_person_style = "I" if re.search(r"\b(i|my|myself|i'm)\b", full_text) and not re.search(r"\b(we|our|team|us)\b", full_text) else "we"

        # Analyze formality & greeting
        greeting = "Hi [Name],"
        if any(w in full_text for w in ["dear", "esteemed", "valued"]):
            greeting = "Dear [Name],"
            formality = "Professional & structured"
        elif any(w in full_text for w in ["hey", "cheers", "thanks mate", "super glad"]):
            greeting = "Hey [Name]!"
            formality = "Casual & warm"
        else:
            greeting = "Hello [Name],"
            formality = "Polished & friendly"

        # Sign-off
        sign_off = f"Warmly,\nThe {business_name} Team" if first_person_style == "we" else f"Best regards,\nOwner, {business_name}"
        if "cheers" in full_text:
            sign_off = f"Cheers,\n{business_name}"

        # Preferred phrases extracted or customized
        preferred_phrases = [
            f"Delighted to welcome you to {business_name}",
            "Thank you for sharing your experience",
            "Looking forward to hosting you again",
        ]
        avoided_phrases = [
            "We apologize for any inconvenience caused",
            "As per company policy",
            "Your feedback has been logged in our system",
        ]

        return VoiceAnalysisResult(
            tone="Warm, hospitable, attentive, and community-minded",
            formality=formality,
            preferred_length="Balanced (2-4 sentences)",
            greeting=greeting,
            sign_off=sign_off,
            preferred_phrases=preferred_phrases,
            avoided_phrases=avoided_phrases,
            first_person_style=first_person_style,
            language_preference="en",
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
        lower_review = review_text.lower()
        name_placeholder = reviewer_name.strip() if reviewer_name else "there"

        # Determine sentiment & safety flags
        is_sensitive = any(
            w in lower_review
            for w in [
                "poison", "hospital", "lawyer", "sue", "police", "harass",
                "fraud", "scam", "threat", "injury", "bleeding"
            ]
        )
        
        is_negative = (
            star_rating is not None and star_rating <= 2
        ) or any(
            w in lower_review
            for w in [
                "terrible", "worst", "horrible", "rude", "bad", "cold", "dirty",
                "disaster", "never again", "disappointing", "awful", "waste"
            ]
        )

        is_neutral = (
            star_rating == 3
        ) or any(
            w in lower_review for w in ["average", "okay", "decent", "could be better"]
        )

        greeting = (voice_profile.get("greeting") or "Hello [Name],").replace("[Name]", name_placeholder)
        sign_off = voice_profile.get("sign_off") or f"Warmly,\nThe {business_name} Team"
        first_person = voice_profile.get("first_person_style", "we")
        pronoun_we = "we" if first_person == "we" else "I"
        pronoun_our = "our" if first_person == "we" else "my"

        safety_flags = SafetyFlags(
            is_sensitive=is_sensitive,
            allegation_detected=is_sensitive,
            private_channel_offered=is_negative or is_sensitive,
            summary="Sensitive claim detected - handle with care." if is_sensitive else None,
        )

        contact_offer = ""
        if contact_email and contact_phone:
            contact_offer = f"Please reach out directly to {pronoun_our} team at {contact_email} or {contact_phone} so {pronoun_we} can listen and make this right."
        elif contact_email:
            contact_offer = f"Please feel free to write to {pronoun_our} management directly at {contact_email} so {pronoun_we} can look into this personally."
        elif contact_phone:
            contact_offer = f"Please give {pronoun_our} team a call directly at {contact_phone} so {pronoun_we} can hear more and assist."
        else:
            contact_offer = f"Please speak with {pronoun_our} manager on your next visit or message us directly so {pronoun_we} can address your concerns in detail."

        if is_sensitive:
            sentiment = "sensitive"
            reply_text = (
                f"{greeting}\n\n"
                f"Thank you for bringing this to {pronoun_our} attention. We take feedback of this nature with utmost seriousness. "
                f"{contact_offer} Your comfort, safety, and satisfaction are always {pronoun_our} highest priorities.\n\n"
                f"{sign_off}"
            )
        elif is_negative:
            sentiment = "negative"
            reply_text = (
                f"{greeting}\n\n"
                f"Thank you for sharing your candid feedback with us. {pronoun_we.capitalize()} are genuinely sorry to hear that your experience fell short of the high standards {pronoun_we} hold ourselves to at {business_name}. "
                f"{contact_offer} {pronoun_we.capitalize()} truly appreciate your patience and the opportunity to improve.\n\n"
                f"{sign_off}"
            )
        elif is_neutral:
            sentiment = "neutral"
            reply_text = (
                f"{greeting}\n\n"
                f"Thank you for visiting {business_name} and for taking the time to leave your thoughts. "
                f"{pronoun_we.capitalize()} appreciate your balanced feedback and will certainly share your notes with {pronoun_our} team as {pronoun_we} continue refining our offerings. "
                f"{pronoun_we.capitalize()} hope to welcome you back soon for an even better experience.\n\n"
                f"{sign_off}"
            )
        else:
            sentiment = "positive"
            reply_text = (
                f"{greeting}\n\n"
                f"Thank you so much for your kind words and for taking the time to share your review! "
                f"{pronoun_our.capitalize()} whole team at {business_name} is delighted to know you had such a wonderful time. "
                f"{pronoun_we.capitalize()} truly look forward to welcoming you back again soon!\n\n"
                f"{sign_off}"
            )

        return GenerationResult(
            reply=reply_text,
            sentiment=sentiment,
            safety_flags=safety_flags,
            model_provider="mock",
            model_name="replymuse-editorial-mock",
            prompt_tokens=180,
            completion_tokens=95,
        )
