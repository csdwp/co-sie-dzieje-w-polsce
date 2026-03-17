"""Service for fetching and filtering acts."""

from typing import Any, Dict, List, Optional

from ..core.logging import get_logger
from ..repositories.act_repository import ActRepository
from ..repositories.pipeline_queue_repository import PipelineQueueRepository
from ..services.external.sejm_api import SejmAPIClient
from ..utils.validators import validate_act_data

logger = get_logger(__name__)


class ActFetcher:
    """Service for fetching acts from API."""

    def __init__(
        self,
        sejm_api: Optional[SejmAPIClient] = None,
        act_repo: Optional[ActRepository] = None,
        queue_repo: Optional[PipelineQueueRepository] = None,
    ):
        """
        Initialize act fetcher.

        Args:
            sejm_api: Sejm API client
            act_repo: Act repository for idempotency checks
            queue_repo: Pipeline queue repository for deferred ELIs
        """
        self.sejm_api = sejm_api or SejmAPIClient()
        self.act_repo = act_repo or ActRepository()
        self.queue_repo = queue_repo or PipelineQueueRepository()

    def fetch_and_filter_acts(self) -> List[Dict[str, Any]]:
        """
        Fetch acts from API and filter by type.

        Returns:
            List of filtered acts sorted by pos (most recent first)
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

        # Sort by pos (position number in Dz.U.) — most recent first
        # Using pos instead of promulgation date, as promulgation can be set to a future date
        # (e.g. a deferred entry date), which would break the "identify new acts" logic
        filtered_items.sort(key=lambda x: x.get("pos", 0), reverse=True)

        logger.info(f"Found {len(filtered_items)} valid acts")
        return filtered_items

    def identify_new_acts(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify acts not yet present in the database.

        Args:
            items: List of all acts from API

        Returns:
            List of new acts to process
        """
        existing_elis = self.act_repo.get_existing_elis()

        if not existing_elis:
            logger.info("No acts in database yet — processing all available acts...")
            new_acts = items
        else:
            new_acts = [act for act in items if act.get("ELI") not in existing_elis]

        if not new_acts:
            return []

        result = []
        for act in new_acts:
            logger.info(f"New act: {act['type']} - {act['ELI']}")

            # For "Ustawa" type, check if voting details are available
            if act["type"] == "Ustawa":
                if self._check_voting_available(act["ELI"]):
                    result.append(act)
                else:
                    self._save_eli_for_later(act["ELI"])
            else:
                result.append(act)

        logger.info(f"Found {len(result)} new acts to process")
        return result

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
        Save ELI to the queue to check later when voting might be available.

        Args:
            eli: ELI to queue
        """
        if not eli:
            logger.warning("Attempted to queue empty ELI — skipping")
            return

        try:
            self.queue_repo.add(eli)
        except Exception as e:
            logger.error(f"Error queuing ELI for later: {e}")

    def get_elis_to_check_later(self) -> List[str]:
        """
        Get list of ELIs queued for later checking.

        Returns:
            List of ELIs
        """
        try:
            return self.queue_repo.get_all()
        except Exception:
            return []

    def remove_eli_from_later(self, eli: str) -> None:
        """
        Remove ELI from the queue after successful processing.

        Args:
            eli: ELI to remove
        """
        try:
            self.queue_repo.remove(eli)
        except Exception as e:
            logger.error(f"Error removing ELI from queue: {e}")
