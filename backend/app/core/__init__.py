"""Core modules for the application."""

from .config import (
    ACT_ANALYSIS_FILE,
    ACT_CONTENT_FILE,
    API_URL,
    BASIC_URL,
    CURRENT_YEAR,
    DATABASE_URL,
    ELI_FOR_LATER,
    LAST_KNOWN_FILE,
    MAX_ACTS_TO_PROCESS,
    OPENAI_API_KEY,
    PDF_DOWNLOAD_TIMEOUT,
    VOTING_URL,
    check_environment,
)
from .exceptions import (
    AIServiceError,
    BackendException,
    DatabaseError,
    ExternalAPIError,
    FileOperationError,
    PDFProcessingError,
    ValidationError,
)
from .logging import get_logger, setup_logger

__all__ = [
    # Config
    "BASIC_URL",
    "API_URL",
    "VOTING_URL",
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "CURRENT_YEAR",
    "LAST_KNOWN_FILE",
    "ACT_CONTENT_FILE",
    "ELI_FOR_LATER",
    "ACT_ANALYSIS_FILE",
    "MAX_ACTS_TO_PROCESS",
    "PDF_DOWNLOAD_TIMEOUT",
    "check_environment",
    # Logging
    "get_logger",
    "setup_logger",
    # Exceptions
    "BackendException",
    "DatabaseError",
    "ExternalAPIError",
    "AIServiceError",
    "ValidationError",
    "PDFProcessingError",
    "FileOperationError",
]
