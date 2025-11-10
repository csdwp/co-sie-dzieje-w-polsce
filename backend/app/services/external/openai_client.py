"""OpenAI API client for text analysis."""

import json
import os
from typing import Any, Dict, Optional, cast

from dotenv import load_dotenv
from openai import OpenAI

from ...core.exceptions import AIServiceError
from ...core.logging import get_logger
from ...utils.retry_handler import retry_ai_service

logger = get_logger(__name__)
load_dotenv()


class OpenAIClient:
    """Client for OpenAI API interactions."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        """
        Initialize OpenAI client.

        Args:
            api_key: OpenAI API key (default: from env)
            model: Model to use (default: gpt-3.5-turbo)
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
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text},
                ],
                max_tokens=max_tokens,
            )

            content = response.choices[0].message.content

            if expect_json or "json" in prompt.lower():
                try:
                    return cast(
                        Dict[str, Any],
                        json.loads(content if content is not None else "{}"),
                    )
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON format: {content}")
                    return {"error": "Invalid response format", "raw_content": content}

            return {"content": content}

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise AIServiceError(f"OpenAI analysis failed: {e}")

    def close(self) -> None:
        """Close the OpenAI client."""
        if self.client:
            self.client.close()
