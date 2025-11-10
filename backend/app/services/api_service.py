from typing import Any, Optional

import requests

from ..core.config import API_URL, BASIC_URL, CURRENT_YEAR


def fetch_json(url: str, error_prefix: str = "API") -> Optional[Any]:
    if not url:
        print(f"Error: URL is not set ({error_prefix})")
        return None
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError:
        print(f"{error_prefix} error: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"{error_prefix} connection error:", e)
    return None


def fetch_one_law(eli: str) -> Optional[dict]:
    if not BASIC_URL:
        print("Error: BASIC_URL is not set in .env file")
        return None
    return fetch_json(f"{BASIC_URL}//{eli}", error_prefix="Law")


def get_voting_data(url: str) -> Optional[dict]:
    return fetch_json(url, error_prefix="Voting")


def fetch_api_data() -> Optional[list[dict]]:
    if not API_URL:
        print("Error: API_URL is not set in .env file")
        return None
    data = fetch_json(f"{API_URL}/{CURRENT_YEAR}", error_prefix="API")
    return data.get("items", []) if isinstance(data, dict) else None
