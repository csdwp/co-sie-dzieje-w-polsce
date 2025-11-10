"""Main pipeline orchestrator."""

from typing import Any, Dict, Optional

from ..core.config import (
    ELI_FOR_LATER,
    LAST_KNOWN_FILE,
    MAX_ACTS_TO_PROCESS,
    check_environment,
)
from ..core.logging import get_logger
from ..services.act_processor import ActProcessor
from ..services.external.sejm_api import SejmAPIClient
from ..utils.file_handler import FileHandler
from .act_fetcher import ActFetcher

logger = get_logger(__name__)


class PipelineOrchestrator:
    """Main orchestrator for the act processing pipeline."""

    def __init__(
        self,
        fetcher: Optional[ActFetcher] = None,
        processor: Optional[ActProcessor] = None,
        sejm_api: Optional[SejmAPIClient] = None,
        file_handler: Optional[FileHandler] = None,
    ):
        """
        Initialize pipeline orchestrator.

        Args:
            fetcher: Act fetcher
            processor: Act processor
            sejm_api: Sejm API client
            file_handler: File handler
        """
        self.fetcher = fetcher or ActFetcher()
        self.processor = processor or ActProcessor()
        self.sejm_api = sejm_api or SejmAPIClient()
        self.file_handler = file_handler or FileHandler()

    def check_for_new_acts(self) -> None:
        """
        Main entry point: Check for new acts and process them.
        """
        if not check_environment():
            logger.error("Missing required environment variables")
            return

        logger.info("=" * 50)
        logger.info("Starting act processing pipeline")
        logger.info("=" * 50)

        # Fetch and filter acts
        items = self.fetcher.fetch_and_filter_acts()

        if not items:
            logger.info("No acts to process")
            return

        # Identify new acts
        new_acts = self.fetcher.identify_new_acts(items)

        if not new_acts:
            logger.info("No new legal acts found")
            return

        logger.info(f"🔔 Found {len(new_acts)} new legal acts!")

        # Limit number of acts to process
        acts_to_process = new_acts[:MAX_ACTS_TO_PROCESS]

        if len(new_acts) > MAX_ACTS_TO_PROCESS:
            logger.info(f"Limiting to {MAX_ACTS_TO_PROCESS} acts per run")

        # Process acts (oldest first)
        success_count = 0
        for act in reversed(acts_to_process):
            if self.processor.process_and_save(act):
                success_count += 1

        logger.info(
            f"Successfully processed {success_count}/{len(acts_to_process)} acts"
        )

        # Save last known act
        if new_acts:
            self._save_last_known(new_acts[0])

    def check_old_elis(self) -> None:
        """
        Check ELIs saved for later (acts without voting data at first check).
        """
        logger.info("=" * 50)
        logger.info("Checking ELIs saved for later")
        logger.info("=" * 50)

        elis = self.fetcher.get_elis_to_check_later()

        if not elis:
            logger.info("No ELIs to check later")
            return

        logger.info(f"🔔 Found {len(elis)} ELIs to check voting details later!")

        remaining_elis = []

        for eli in elis:
            logger.info(f"Checking ELI: {eli}")

            if self.fetcher._check_voting_available(eli):
                # Voting is now available, fetch and process
                act_details = self.sejm_api.fetch_act_details(eli)

                if act_details:
                    # Convert to format expected by processor
                    act_data = {
                        "ELI": act_details.eli,
                        "title": act_details.title,
                        "type": act_details.type,
                        "promulgation": act_details.promulgation,
                    }

                    if self.processor.process_and_save(act_data):
                        logger.info(f"✅ Successfully processed delayed act: {eli}")
                        continue

                logger.error(f"❌ Failed to process delayed act: {eli}")
                remaining_elis.append(eli)
            else:
                logger.info(f"Voting still not available for: {eli}")
                remaining_elis.append(eli)

        # Update the file with remaining ELIs
        if remaining_elis:
            self.file_handler.write_lines(ELI_FOR_LATER, remaining_elis)
            logger.info(f"{len(remaining_elis)} ELIs still waiting for voting data")
        else:
            # Remove file if all ELIs processed
            import os

            if os.path.exists(ELI_FOR_LATER):
                os.remove(ELI_FOR_LATER)
            logger.info("All delayed ELIs processed successfully!")

    def _save_last_known(self, act: Dict[str, Any]) -> None:
        """
        Save last known act to file.

        Args:
            act: Act data to save
        """
        try:
            self.file_handler.write_json(LAST_KNOWN_FILE, act)
            logger.info(f"Saved last known act: {act.get('ELI')}")
        except Exception as e:
            logger.error(f"Error saving last known act: {e}")


def check_for_new_acts() -> None:
    """Public entry point for checking new acts."""
    orchestrator = PipelineOrchestrator()
    orchestrator.check_for_new_acts()


def check_old_elis() -> None:
    """Public entry point for checking old ELIs."""
    orchestrator = PipelineOrchestrator()
    orchestrator.check_old_elis()
