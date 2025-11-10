"""PDF processing service for downloading and extracting text."""

import os
from typing import Optional

import fitz  # type: ignore[import-untyped]  # PyMuPDF
import requests

from ...core.config import PDF_DOWNLOAD_TIMEOUT
from ...core.exceptions import PDFProcessingError
from ...core.logging import get_logger
from ...utils.retry_handler import retry_external_api

logger = get_logger(__name__)


class PDFProcessor:
    """Service for processing PDF files."""

    def __init__(self, download_timeout: Optional[int] = None):
        """
        Initialize PDF processor.

        Args:
            download_timeout: Timeout for PDF download (default: from config)
        """
        self.download_timeout = download_timeout or PDF_DOWNLOAD_TIMEOUT

    @retry_external_api
    def download_pdf(self, url: str, filename: str = "temp.pdf") -> Optional[str]:
        """
        Download PDF from URL.

        Args:
            url: URL to download from
            filename: Local filename to save to

        Returns:
            Filename if successful, None otherwise
        """
        try:
            logger.info(f"Downloading PDF from: {url}")
            response = requests.get(url, timeout=self.download_timeout, stream=True)
            response.raise_for_status()

            if not response.content:
                logger.warning(f"Empty PDF content from {url}")
                return None

            # Validate PDF header
            if not response.content.startswith(b"%PDF"):
                logger.error(f"Invalid PDF file from {url}")
                raise PDFProcessingError("Downloaded file is not a valid PDF")

            with open(filename, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            logger.info(f"PDF downloaded successfully: {filename}")
            return filename

        except requests.exceptions.RequestException as e:
            logger.error(f"Error downloading PDF: {e}")
            raise PDFProcessingError(f"Failed to download PDF: {e}")

    def extract_text(self, pdf_path: str) -> str:
        """
        Extract text from PDF file.

        Args:
            pdf_path: Path to PDF file

        Returns:
            Extracted text
        """
        text = ""

        try:
            if not os.path.exists(pdf_path):
                raise PDFProcessingError(f"PDF file not found: {pdf_path}")

            logger.info(f"Extracting text from PDF: {pdf_path}")
            doc = fitz.open(pdf_path)

            for page_num, page in enumerate(doc, 1):
                page_text = page.get_text()
                text += page_text
                logger.debug(f"Extracted {len(page_text)} chars from page {page_num}")

            doc.close()
            logger.info(f"Total text extracted: {len(text)} characters")

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise PDFProcessingError(f"Failed to extract text: {e}")

        return text

    def download_and_extract(self, url: str) -> str:
        """
        Download PDF and extract text in one operation.

        Args:
            url: PDF URL

        Returns:
            Extracted text
        """
        temp_file = None
        text = ""

        try:
            temp_file = self.download_pdf(url)

            if not temp_file or not os.path.exists(temp_file):
                raise PDFProcessingError(
                    f"PDF file not downloaded correctly from {url}"
                )

            text = self.extract_text(temp_file)

        finally:
            # Cleanup temporary file
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                    logger.debug(f"Removed temporary file: {temp_file}")
                except OSError as e:
                    logger.warning(f"Unable to remove temporary file: {e}")

        return text

    def save_text(self, text: str, filename: str) -> bool:
        """
        Save extracted text to file.

        Args:
            text: Text to save
            filename: Output filename

        Returns:
            True if successful
        """
        try:
            with open(filename, "w", encoding="utf-8") as f:
                f.write(text)
            logger.info(f"Text saved to file: {filename}")
            return True
        except Exception as e:
            logger.error(f"Error saving text to file: {e}")
            raise PDFProcessingError(f"Failed to save text: {e}")
