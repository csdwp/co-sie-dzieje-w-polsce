"""Main pipeline orchestrator."""

import time
from typing import Optional

import requests

from ..core.config import (
    MAX_ACTS_TO_PROCESS,
    TWITTER_POST_DELAY_MINUTES,
    VERCEL_DEPLOY_HOOK_URL,
    check_environment,
)
from ..core.logging import get_logger
from ..repositories.pipeline_queue_repository import PipelineQueueRepository
from ..services.act_processor import ActProcessor
from ..services.external.sejm_api import SejmAPIClient
from ..services.twitter_publisher import TwitterPublisher
from .act_fetcher import ActFetcher

logger = get_logger(__name__)


class PipelineOrchestrator:
    """Main orchestrator for the act processing pipeline."""

    def __init__(
        self,
        fetcher: Optional[ActFetcher] = None,
        processor: Optional[ActProcessor] = None,
        sejm_api: Optional[SejmAPIClient] = None,
        queue_repo: Optional[PipelineQueueRepository] = None,
        twitter_publisher: Optional[TwitterPublisher] = None,
    ):
        """
        Initialize pipeline orchestrator.

        Args:
            fetcher: Act fetcher
            processor: Act processor
            sejm_api: Sejm API client
            queue_repo: Pipeline queue repository
            twitter_publisher: Twitter publisher for posting new acts
        """
        self.fetcher = fetcher or ActFetcher()
        self.processor = processor or ActProcessor()
        self.sejm_api = sejm_api or SejmAPIClient()
        self.queue_repo = queue_repo or PipelineQueueRepository()
        self.twitter_publisher = twitter_publisher or TwitterPublisher()

    def check_for_new_acts(self) -> list:
        """
        Main entry point: Check for new acts and process them.

        Returns:
            List of successfully processed act titles.
        """
        if not check_environment():
            logger.error("Missing required environment variables")
            return []

        logger.info("=" * 50)
        logger.info("Starting act processing pipeline")
        logger.info("=" * 50)

        # Fetch and filter acts
        items = self.fetcher.fetch_and_filter_acts()

        if not items:
            logger.info("No acts to process")
            return []

        # Identify new acts
        new_acts = self.fetcher.identify_new_acts(items)

        if not new_acts:
            logger.info("No new legal acts found")
            return []

        logger.info(f"🔔 Found {len(new_acts)} new legal acts!")

        # Limit number of acts to process
        acts_to_process = new_acts[:MAX_ACTS_TO_PROCESS]

        if len(new_acts) > MAX_ACTS_TO_PROCESS:
            logger.info(f"Limiting to {MAX_ACTS_TO_PROCESS} acts per run")

        # Process acts (oldest first)
        processed = []
        for i, act in enumerate(reversed(acts_to_process)):
            result = self.processor.process_and_save(act)
            if result:
                act_id, processed_act = result
                processed.append((act.get("title", act.get("ELI", "?")), act_id))

                if i > 0 and TWITTER_POST_DELAY_MINUTES > 0:
                    logger.info(f"Waiting {TWITTER_POST_DELAY_MINUTES}m before next tweet")
                    time.sleep(TWITTER_POST_DELAY_MINUTES * 60)

                self.twitter_publisher.publish_act(processed_act, act_id)

        logger.info(
            f"Successfully processed {len(processed)}/{len(acts_to_process)} acts"
        )

        self._trigger_vercel_deploy()

        return processed

    def check_old_elis(self) -> list:
        """
        Check ELIs queued for later (acts without voting data at first check).

        Returns:
            List of successfully processed ELIs.
        """
        logger.info("=" * 50)
        logger.info("Checking ELIs saved for later")
        logger.info("=" * 50)

        elis = self.fetcher.get_elis_to_check_later()

        if not elis:
            logger.info("No ELIs to check later")
            return []

        logger.info(f"🔔 Found {len(elis)} ELIs to check voting details later!")

        processed = []

        for eli in elis:
            logger.info(f"Checking ELI: {eli}")

            if self.fetcher._check_voting_available(eli):
                # Voting is now available, fetch and process
                act_details = self.sejm_api.fetch_act_details(eli)

                if act_details:
                    act_data = {
                        "ELI": act_details.eli,
                        "title": act_details.title,
                        "type": act_details.type,
                        "promulgation": act_details.promulgation,
                    }

                    result = self.processor.process_and_save(act_data)
                    if result:
                        act_id, processed_act = result
                        logger.info(f"✅ Successfully processed delayed act: {eli}")
                        processed.append((act_details.title or eli, act_id))
                        self.twitter_publisher.publish_act(processed_act, act_id)
                        self.queue_repo.remove(eli)
                        continue

                # ELI celowo NIE jest usuwany z kolejki — zostanie ponowiony przy następnym uruchomieniu
                logger.error(f"❌ Failed to process delayed act: {eli}")
            else:
                # ELI celowo NIE jest usuwany z kolejki — głosowanie jeszcze niedostępne
                logger.info(f"Voting still not available for: {eli}")

        remaining = len(self.queue_repo.get_all())
        if remaining:
            logger.info(f"{remaining} ELIs still waiting for voting data")
        else:
            logger.info("All delayed ELIs processed successfully!")

        if processed:
            self._trigger_vercel_deploy()

        return processed

    def _trigger_vercel_deploy(self) -> None:
        """Trigger Vercel deploy hook to rebuild the frontend."""
        if not VERCEL_DEPLOY_HOOK_URL:
            logger.debug("VERCEL_DEPLOY_HOOK_URL not set, skipping deploy trigger")
            return

        try:
            response = requests.post(VERCEL_DEPLOY_HOOK_URL, timeout=10)
            logger.info(f"Vercel deploy triggered (status {response.status_code})")
        except Exception as e:
            logger.error(f"Failed to trigger Vercel deploy: {e}")


def check_for_new_acts() -> list:
    """Public entry point for checking new acts."""
    orchestrator = PipelineOrchestrator()
    return orchestrator.check_for_new_acts()


def check_old_elis() -> list:
    """Public entry point for checking old ELIs."""
    orchestrator = PipelineOrchestrator()
    return orchestrator.check_old_elis()
