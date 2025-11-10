"""Act processing orchestrator service."""

from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from ..core.exceptions import AIServiceError, PDFProcessingError
from ..core.logging import get_logger
from ..models.act import Act, ActData
from ..repositories.act_repository import ActRepository
from .ai.categorizer import Categorizer
from .ai.text_analyzer import TextAnalyzer
from .external.pdf_processor import PDFProcessor
from .external.sejm_api import SejmAPIClient
from .votes_calculator import VotesCalculator

logger = get_logger(__name__)


class ActProcessor:
    """Service for orchestrating act processing pipeline."""

    def __init__(
        self,
        sejm_api: Optional[SejmAPIClient] = None,
        pdf_processor: Optional[PDFProcessor] = None,
        text_analyzer: Optional[TextAnalyzer] = None,
        categorizer: Optional[Categorizer] = None,
        votes_calculator: Optional[VotesCalculator] = None,
        act_repo: Optional[ActRepository] = None,
    ):
        """
        Initialize act processor.

        Args:
            sejm_api: Sejm API client
            pdf_processor: PDF processor
            text_analyzer: Text analyzer
            categorizer: Categorizer
            votes_calculator: Votes calculator
            act_repo: Act repository
        """
        self.sejm_api = sejm_api or SejmAPIClient()
        self.pdf_processor = pdf_processor or PDFProcessor()
        self.text_analyzer = text_analyzer or TextAnalyzer()
        self.categorizer = categorizer or Categorizer()
        self.votes_calculator = votes_calculator or VotesCalculator()
        self.act_repo = act_repo or ActRepository()

    def process_and_save(self, act_data: Dict[str, Any]) -> bool:
        """
        Process a single act through the complete pipeline.

        Pipeline:
        1. Download and extract PDF text
        2. Analyze text with AI
        3. Fetch voting details
        4. Categorize act
        5. Save to database

        Args:
            act_data: Raw act data from API

        Returns:
            True if successful, False otherwise
        """
        eli = act_data.get("ELI")
        title = act_data.get("title", "unknown")

        if not eli:
            logger.error(f"No ELI provided for act: {title}")
            return False

        logger.info(f"Processing act: {title}")

        try:
            # Step 1: Download and extract PDF
            pdf_url = self.sejm_api.get_pdf_url(eli)
            pdf_text = self.pdf_processor.download_and_extract(pdf_url)

            if not pdf_text:
                logger.error(f"No text extracted from PDF for: {title}")
                return False

            # Step 2: Analyze text with AI
            logger.info("Analyzing text with AI...")
            analysis = self.text_analyzer.analyze_full_text(pdf_text)

            # Step 3: Fetch act details and voting
            logger.info("Fetching act details and voting data...")
            act_details = self.sejm_api.fetch_act_details(eli)

            if not act_details:
                logger.error(f"Could not fetch details for: {eli}")
                return False

            voting_details = self._get_voting_details(act_details)

            # Step 4: Categorize act
            logger.info("Categorizing act...")
            keywords = act_details.keywords
            category = None

            if keywords:
                category = self.categorizer.find_or_create_category(
                    act_keywords=keywords,
                    act_title=title,
                    act_content=analysis.content_html,
                )

            # Step 5: Build Act entity
            act = self._build_act_entity(
                act_details=act_details,
                analysis=analysis,
                voting_details=voting_details,
                category=category,
                pdf_url=pdf_url,
            )

            # Step 6: Save to database
            logger.info("Saving to database...")
            success = self.act_repo.save_act(act)

            if success:
                logger.info(f"✅ Successfully processed act: {title}")
            else:
                logger.error(f"❌ Failed to save act: {title}")

            return success

        except PDFProcessingError as e:
            logger.error(f"PDF processing failed for {title}: {e}")
            return False
        except AIServiceError as e:
            logger.error(f"AI analysis failed for {title}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error processing {title}: {e}")
            return False

    def _get_voting_details(self, act_details: ActData) -> Optional[Dict[str, Any]]:
        """
        Extract and fetch voting details from act details.

        Args:
            act_details: Act details from API

        Returns:
            Voting data or None
        """
        prints = act_details.prints

        if not prints or not isinstance(prints, list):
            return None

        process_api_link = prints[0].get("linkProcessAPI")
        if not process_api_link:
            return None

        # Fetch process data
        voting_data = self.sejm_api.fetch_voting_process(process_api_link)
        if not voting_data:
            return None

        # Extract voting parameters
        sitting, voting_number = self._extract_last_vote_info(voting_data)
        if not sitting or not voting_number:
            return None

        # Fetch detailed voting
        detailed_voting = self.sejm_api.fetch_sejm_voting(10, sitting, voting_number)
        if not detailed_voting:
            return None

        # Calculate voting statistics
        return self.votes_calculator.process_voting_data(detailed_voting, term=10)

    def _extract_last_vote_info(
        self, process_data: Dict[str, Any]
    ) -> Tuple[Optional[int], Optional[int]]:
        """
        Extract last voting information from process data.

        Args:
            process_data: Process data from API

        Returns:
            Tuple of (sitting, voting_number) or (None, None)
        """
        stages = process_data.get("stages", [])
        last_vote = None

        for stage in stages:
            stage_entries = (
                stage.get("children", []) if "children" in stage else [stage]
            )

            for entry in stage_entries:
                if entry.get("stageName", "").lower() == "głosowanie":
                    last_vote = entry

        if last_vote and "voting" in last_vote:
            sitting = last_vote["voting"].get("sitting")
            voting_number = last_vote["voting"].get("votingNumber")
            return sitting, voting_number

        return None, None

    def _build_act_entity(
        self,
        act_details: ActData,
        analysis: Any,
        voting_details: Optional[Dict[str, Any]],
        category: Optional[str],
        pdf_url: str,
    ) -> Act:
        """
        Build Act entity from processed data.

        Args:
            act_details: Details from API
            analysis: AI analysis result
            voting_details: Voting data
            category: Category name
            pdf_url: URL to PDF file

        Returns:
            Act entity
        """
        act_number = act_details.eli.split("/")[-1] if act_details.eli else None

        # Parse dates
        announcement_date = self._parse_date(act_details.announcement_date)
        change_date = self._parse_date(act_details.change_date)
        promulgation = self._parse_date(act_details.promulgation)

        return Act(
            title=act_details.title,
            act_number=act_number,
            simple_title=analysis.title,
            content=analysis.content_html,
            refs=act_details.references,
            texts=act_details.texts,
            item_type=act_details.type,
            announcement_date=announcement_date,
            change_date=change_date,
            promulgation=promulgation,
            item_status=act_details.status,
            comments=act_details.comments,
            keywords=act_details.keywords,
            file=pdf_url,
            votes=voting_details,
            category=category,
        )

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """
        Parse date string to datetime.

        Args:
            date_str: Date string in YYYY-MM-DD format

        Returns:
            datetime object or None
        """
        if not date_str:
            return None

        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            logger.warning(f"Invalid date format: {date_str}")
            return None
