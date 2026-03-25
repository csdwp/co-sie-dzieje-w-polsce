"""Client for X (Twitter) API interactions."""

from typing import Optional

import tweepy

from ...core.config import (
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_TOKEN_SECRET,
    TWITTER_API_KEY,
    TWITTER_API_KEY_SECRET,
)
from ...core.logging import get_logger

logger = get_logger(__name__)


class TwitterClient:
    """Client for posting to X (Twitter)."""

    def __init__(self):
        """Initialize Twitter client with API credentials."""
        self._client: Optional[tweepy.Client] = None

        if all(
            [
                TWITTER_API_KEY,
                TWITTER_API_KEY_SECRET,
                TWITTER_ACCESS_TOKEN,
                TWITTER_ACCESS_TOKEN_SECRET,
            ]
        ):
            self._client = tweepy.Client(
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_KEY_SECRET,
                access_token=TWITTER_ACCESS_TOKEN,
                access_token_secret=TWITTER_ACCESS_TOKEN_SECRET,
            )
        else:
            logger.warning(
                "Twitter API credentials not configured — posting disabled"
            )

    @property
    def is_configured(self) -> bool:
        """Check if the client has valid credentials."""
        return self._client is not None

    def post_tweet(self, text: str) -> Optional[str]:
        """
        Post a tweet to X.

        Args:
            text: Tweet text (max 280 characters)

        Returns:
            Tweet ID if successful, None otherwise
        """
        if not self._client:
            logger.warning("Twitter client not configured, skipping tweet")
            return None

        try:
            response = self._client.create_tweet(text=text)
            tweet_id = response.data["id"]
            logger.info(f"Tweet posted successfully: {tweet_id}")
            return tweet_id
        except tweepy.TweepyException as e:
            logger.error(f"Failed to post tweet: {e}")
            return None
