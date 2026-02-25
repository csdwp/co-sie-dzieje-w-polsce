"""OpenAI API client for text analysis."""

import json
import os
import re
from typing import Any, Dict, Optional, cast

from dotenv import load_dotenv
from openai import OpenAI

from ...core.exceptions import AIServiceError, InsufficientQuotaError
from ...core.logging import get_logger
from ...utils.retry_handler import retry_ai_service

logger = get_logger(__name__)
load_dotenv()


class OpenAIClient:
    """Client for OpenAI API interactions."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        """
        Initialize OpenAI client.

        Args:
            api_key: OpenAI API key (default: from env)
            model: Model to use (default: gpt-4o-mini)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise AIServiceError("OpenAI API key is not set")

        self.model = model
        self.client = OpenAI(api_key=self.api_key)

    @retry_ai_service
    def analyze_with_prompt(
        self, text: str, prompt: str, max_tokens: int = 1000, expect_json: bool = False
    ) -> Dict[str, Any]:
        """
        Analyze text with OpenAI using a custom prompt.

        Args:
            text: Text to analyze
            prompt: System prompt for the analysis
            max_tokens: Maximum tokens in response
            expect_json: Whether to expect JSON response

        Returns:
            Analysis result as dictionary (parsed JSON or {"content": text})
        """
        logger.info(f"Analyzing text, length: {len(text)} characters")

        try:
            create_kwargs: Dict[str, Any] = dict(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text},
                ],
                max_tokens=max_tokens,
            )
            if expect_json:
                create_kwargs["response_format"] = {"type": "json_object"}

            response = self.client.chat.completions.create(**create_kwargs)

            content = response.choices[0].message.content

            if expect_json or "json" in prompt.lower():
                try:
                    cleaned = (content or "").strip()
                    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                    cleaned = re.sub(r"\s*```$", "", cleaned)
                    return cast(
                        Dict[str, Any],
                        json.loads(cleaned or "{}"),
                    )
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON format: {content}")
                    return {"error": "Invalid response format", "raw_content": content}

            return {"content": content}

        except Exception as e:
            # Check if this is a quota exceeded error
            error_str = str(e).lower()
            if "insufficient_quota" in error_str or "quota" in error_str:
                logger.error(f"OpenAI quota exceeded: {e}")
                raise InsufficientQuotaError(f"OpenAI quota exceeded: {e}")

            logger.error(f"OpenAI API error: {e}")
            raise AIServiceError(f"OpenAI analysis failed: {e}")

    def close(self) -> None:
        """Close the OpenAI client."""
        if self.client:
            self.client.close()
