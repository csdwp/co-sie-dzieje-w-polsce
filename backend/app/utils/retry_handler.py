"""Retry logic decorators for external services."""

from functools import wraps

import requests
from openai import APIError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from ..core.logging import get_logger

logger = get_logger(__name__)


def retry_external_api(func):
    """
    Decorator for retrying external API calls.

    Retries up to 3 times with exponential backoff for network errors.
    """

    @wraps(func)
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type(
            (
                requests.exceptions.RequestException,
                requests.exceptions.Timeout,
                requests.exceptions.ConnectionError,
            )
        ),
        before_sleep=lambda retry_state: logger.warning(
            f"Retrying {func.__name__} after error: {retry_state.outcome.exception() if retry_state.outcome else 'Unknown error'}"
        ),
    )
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper


def retry_ai_service(func):
    """
    Decorator for retrying AI service calls.

    Retries up to 5 times with exponential backoff for OpenAI API errors.
    """

    @wraps(func)
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=4, max=60),
        retry=retry_if_exception_type(APIError),
        before_sleep=lambda retry_state: logger.warning(
            f"Retrying {func.__name__} after AI error: {retry_state.outcome.exception() if retry_state.outcome else 'Unknown error'}"
        ),
    )
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper
