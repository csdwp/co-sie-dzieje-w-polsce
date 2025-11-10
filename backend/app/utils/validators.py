"""Validation utilities for data integrity."""

import re
from typing import Any, Dict, List, Optional, Union

from ..core.logging import get_logger

logger = get_logger(__name__)


def validate_eli_format(eli: str) -> bool:
    """
    Validate ELI (European Legislation Identifier) format.

    Args:
        eli: ELI string to validate

    Returns:
        True if valid, False otherwise
    """
    if not eli or not isinstance(eli, str):
        return False

    # Basic ELI format: /pl/act/dz/2024/123
    pattern = r"^/[a-z]{2}/[a-z]+/[a-z]+/\d{4}/\d+.*$"
    return bool(re.match(pattern, eli))


def validate_act_data(data: Dict[str, Any]) -> bool:
    """
    Validate act data structure before processing.

    Args:
        data: Act data dictionary

    Returns:
        True if valid, False otherwise
    """
    required_fields = ["ELI", "title", "type"]

    # Check required fields
    for field in required_fields:
        if field not in data:
            logger.error(f"Missing required field: {field}")
            return False

        if not data[field]:
            logger.error(f"Empty value for required field: {field}")
            return False

    # Validate ELI format
    if not validate_eli_format(data["ELI"]):
        logger.error(f"Invalid ELI format: {data['ELI']}")
        return False

    # Validate type
    valid_types = ["Ustawa", "Rozporządzenie"]
    if data["type"] not in valid_types:
        logger.warning(f"Unexpected act type: {data['type']}")
        return False

    return True


def validate_keywords(keywords: Optional[Union[List[str], List[Any]]]) -> bool:
    """
    Validate keywords format.

    Args:
        keywords: Keywords to validate

    Returns:
        True if valid, False otherwise
    """
    if keywords is None:
        return True

    if not isinstance(keywords, list):
        logger.error(f"Keywords must be a list, got {type(keywords)}")
        return False

    if not all(isinstance(k, str) for k in keywords):
        logger.error("All keywords must be strings")
        return False

    return True
