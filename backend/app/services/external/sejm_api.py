"""Client for Sejm API interactions."""

from typing import Any, Dict, List, Optional, Union, cast

import requests

from ...core.config import API_URL, BASIC_URL, CURRENT_YEAR
from ...core.exceptions import ExternalAPIError
from ...core.logging import get_logger
from ...models.act import ActData
from ...utils.retry_handler import retry_external_api

logger = get_logger(__name__)


class SejmAPIClient:
    """Client for interacting with Sejm (Polish Parliament) API."""

    def __init__(self):
        """Initialize Sejm API client."""
        self.basic_url = BASIC_URL
        self.api_url = API_URL
        self.current_year = CURRENT_YEAR

        if not self.basic_url:
            raise ExternalAPIError("BASIC_URL is not set in environment")
        if not self.api_url:
            raise ExternalAPIError("API_URL is not set in environment")

    @retry_external_api
    def _fetch_json(self, url: str) -> Optional[Union[Dict[str, Any], List[Any]]]:
        """
        Fetch JSON data from URL.

        Args:
            url: URL to fetch from

        Returns:
            JSON response data or None
        """
        if not url:
            logger.error("URL is not provided")
            return None

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return cast(Union[Dict[str, Any], List[Any]], response.json())
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error {response.status_code}: {e}")
            raise ExternalAPIError(f"HTTP error: {response.status_code}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {e}")
            raise ExternalAPIError(f"Request failed: {e}")

    def fetch_acts_for_year(
        self, year: Optional[int] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch all acts for a given year.

        Args:
            year: Year to fetch acts for (default: current year)

        Returns:
            List of acts or None
        """
        year = year or self.current_year
        url = f"{self.api_url}/{year}"

        logger.info(f"Fetching acts for year {year}")
        data = self._fetch_json(url)

        if isinstance(data, dict):
            items = data.get("items", [])
            return cast(List[Dict[str, Any]], items) if items else []

        return None

    def fetch_act_details(self, eli: str) -> Optional[ActData]:
        """
        Fetch detailed information about a specific act.

        Args:
            eli: European Legislation Identifier

        Returns:
            Act details or None
        """
        url = f"{self.basic_url}//{eli}"
        logger.info(f"Fetching act details for ELI: {eli}")
        data = self._fetch_json(url)
        if isinstance(data, dict):
            try:
                return ActData(
                    eli=eli,
                    title=data.get("title", ""),
                    type=data.get("type", ""),
                    promulgation=data.get("promulgation", ""),
                    announcement_date=data.get("announcementDate"),
                    change_date=data.get("changeDate"),
                    status=data.get("status"),
                    comments=data.get("comments"),
                    keywords=data.get("keywords", []),
                    references=data.get("references"),
                    texts=data.get("texts"),
                    prints=data.get("prints", []),
                )
            except Exception as e:
                logger.error(f"Failed to parse act data: {e}")
                return None
        return None

    def fetch_voting_process(self, process_url: str) -> Optional[Dict[str, Any]]:
        """
        Fetch voting process data.

        Args:
            process_url: URL to the process API

        Returns:
            Process data or None
        """
        logger.info(f"Fetching voting process from: {process_url}")
        data = self._fetch_json(process_url)
        return cast(Optional[Dict[str, Any]], data) if isinstance(data, dict) else None

    def fetch_sejm_voting(
        self, term: int, sitting: int, voting_number: int
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed voting data from Sejm API.

        Args:
            term: Parliamentary term number
            sitting: Sitting number
            voting_number: Voting number

        Returns:
            Voting data or None
        """
        url = (
            f"https://api.sejm.gov.pl/sejm/term{term}/votings/{sitting}/{voting_number}"
        )
        logger.info(
            f"Fetching Sejm voting: term={term}, sitting={sitting}, voting={voting_number}"
        )
        data = self._fetch_json(url)
        return cast(Optional[Dict[str, Any]], data) if isinstance(data, dict) else None

    def get_pdf_url(self, eli: str) -> str:
        """
        Get PDF URL for an act.

        Args:
            eli: European Legislation Identifier

        Returns:
            PDF URL
        """
        return f"{self.basic_url}{eli}/text.pdf"
