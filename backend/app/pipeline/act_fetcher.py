"""Service for fetching and filtering acts."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from ..core.config import ELI_FOR_LATER, LAST_KNOWN_FILE
from ..core.logging import get_logger
from ..services.external.sejm_api import SejmAPIClient
from ..utils.file_handler import FileHandler
from ..utils.validators import validate_act_data

logger = get_logger(__name__)


class ActFetcher:
    """Service for fetching acts from API."""

    def __init__(
        self,
        sejm_api: Optional[SejmAPIClient] = None,
        file_handler: Optional[FileHandler] = None,
    ):
        """
        Initialize act fetcher.

        Args:
            sejm_api: Sejm API client
            file_handler: File handler utility
        """
        self.sejm_api = sejm_api or SejmAPIClient()
        self.file_handler = file_handler or FileHandler()

    def fetch_and_filter_acts(self) -> List[Dict[str, Any]]:
        """
        Fetch acts from API and filter by type.

        Returns:
            List of filtered acts sorted by promulgation date
        """
        logger.info("Fetching acts from API...")
        items = self.sejm_api.fetch_acts_for_year()

        if not items:
            logger.error("Failed to fetch data from API")
            return []

        # Filter by type
        valid_types = ["Ustawa", "Rozporządzenie"]
        filtered_items = [
            item
            for item in items
            if item.get("type") in valid_types and validate_act_data(item)
        ]

        if not filtered_items:
            logger.warning("No legal acts meeting the criteria")
            return []

        # Sort by promulgation date (most recent first)
        filtered_items.sort(
            key=lambda x: datetime.strptime(x["promulgation"], "%Y-%m-%d"), reverse=True
        )

        logger.info(f"Found {len(filtered_items)} valid acts")
        return filtered_items

    def identify_new_acts(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify new acts since last known.

        Args:
            items: List of all acts

        Returns:
            List of new acts to process
        """
        last_known = self.file_handler.read_json(LAST_KNOWN_FILE)

        if not last_known:
            logger.info(
                "📄 No previously saved act found — processing all available acts..."
            )
            return items

        new_acts = []
        last_known_eli = last_known.get("ELI")

        for act in items:
            if act["ELI"] == last_known_eli:
                break

            logger.info(f"New act: {act['type']} - {act['ELI']}")

            # For "Ustawa" type, check if voting details are available
            if act["type"] == "Ustawa":
                if self._check_voting_available(act["ELI"]):
                    new_acts.append(act)
                else:
                    self._save_eli_for_later(act["ELI"])
            else:
                new_acts.append(act)

        logger.info(f"Found {len(new_acts)} new acts to process")
        return new_acts

    def _check_voting_available(self, eli: str) -> bool:
        """
        Check if voting details are available for an act.

        Args:
            eli: Act ELI

        Returns:
            True if voting available, False otherwise
        """
        try:
            act_details = self.sejm_api.fetch_act_details(eli)

            if not act_details:
                logger.warning(f"Could not fetch details for {eli}")
                return False

            prints = act_details.prints
            if not prints or not isinstance(prints, list):
                return False

            process_api_link = prints[0].get("linkProcessAPI")
            if not process_api_link:
                return False

            voting_data = self.sejm_api.fetch_voting_process(process_api_link)
            if not voting_data:
                return False

            # Check if there's voting information
            stages = voting_data.get("stages", [])
            for stage in stages:
                stage_entries = (
                    stage.get("children", []) if "children" in stage else [stage]
                )
                for entry in stage_entries:
                    if entry.get("stageName", "").lower() == "głosowanie":
                        if "voting" in entry:
                            return True

            return False

        except Exception as e:
            logger.error(f"Error checking voting for {eli}: {e}")
            return False

    def _save_eli_for_later(self, eli: str) -> None:
        """
        Save ELI to check later when voting might be available.

        Args:
            eli: ELI to save
        """
        try:
            existing_elis = self.file_handler.read_lines(ELI_FOR_LATER)

            if eli not in existing_elis:
                existing_elis.append(eli)
                self.file_handler.write_lines(ELI_FOR_LATER, existing_elis)
                logger.info(f"Saved ELI for later: {eli}")

        except Exception as e:
            logger.error(f"Error saving ELI for later: {e}")

    def get_elis_to_check_later(self) -> List[str]:
        """
        Get list of ELIs saved for later checking.

        Returns:
            List of ELIs
        """
        try:
            return self.file_handler.read_lines(ELI_FOR_LATER)
        except Exception:
            return []

    def remove_eli_from_later(self, eli: str) -> None:
        """
        Remove ELI from the later list.

        Args:
            eli: ELI to remove
        """
        try:
            existing_elis = self.file_handler.read_lines(ELI_FOR_LATER)
            if eli in existing_elis:
                existing_elis.remove(eli)
                self.file_handler.write_lines(ELI_FOR_LATER, existing_elis)

        except Exception as e:
            logger.error(f"Error removing ELI from later list: {e}")
