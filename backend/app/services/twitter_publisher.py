"""Service for publishing new acts to X (Twitter)."""

import re
from typing import Optional

from ..core.logging import get_logger
from ..models.act import Act
from .external.twitter_client import TwitterClient

logger = get_logger(__name__)

APP_URL = "https://coprzeszlo.pl"

# t.co shortens all URLs to 23 characters
TCO_URL_LENGTH = 23
MAX_TWEET_LENGTH = 280


class TwitterPublisher:
    """Formats and publishes act summaries to X (Twitter)."""

    def __init__(self, client: Optional[TwitterClient] = None):
        """Initialize with an optional TwitterClient."""
        self.client = client or TwitterClient()

    def publish_act(self, act: Act, act_id: int) -> Optional[str]:
        """
        Publish a new act to X.

        Skips acts with low confidence (needs_reprocess=True)
        since those are hidden from regular users.

        Args:
            act: The processed Act entity
            act_id: Database ID for building the URL

        Returns:
            Tweet ID if posted, None otherwise
        """
        if not self.client.is_configured:
            return None

        if act.needs_reprocess:
            logger.info(
                f"Skipping tweet for low-confidence act: {act.simple_title or act.title}"
            )
            return None

        tweet_text = self._format_tweet(act, act_id)
        return self.client.post_tweet(tweet_text)

    def _format_tweet(self, act: Act, act_id: int) -> str:
        """
        Format act data into a tweet.

        Structure:
            {simple_title}

            {content - as much as fits}

            Czytaj więcej: {url}
            #CoSięDziejeWPolsce #prawo
        """
        title = act.simple_title or act.title
        url = APP_URL
        footer = f"Czytaj więcej: {url}\n#CoSięDziejeWPolsce #prawo"

        # Fixed: title + footer + newlines between sections
        # URL counts as 23 chars via t.co
        footer_len = (
            len("Czytaj więcej: ")
            + TCO_URL_LENGTH
            + 1
            + len("#CoSięDziejeWPolsce #prawo")
        )
        fixed_len = len(title) + footer_len + 4  # 4 newlines separating sections

        available = MAX_TWEET_LENGTH - fixed_len
        description = self._strip_html(act.content) if act.content else ""
        description = self._truncate(description, available)

        parts = [title]
        if description:
            parts.append(description)
        parts.append(footer)

        return "\n\n".join(parts)

    def _strip_html(self, html: str) -> str:
        """Remove HTML tags and normalize whitespace."""
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _truncate(self, text: str, max_len: int) -> str:
        """Truncate text to max_len, breaking at word boundary."""
        if not text or max_len <= 0:
            return ""
        if len(text) <= max_len:
            return text
        truncated = text[: max_len - 1].rsplit(" ", 1)[0]
        return truncated + "\u2026"
