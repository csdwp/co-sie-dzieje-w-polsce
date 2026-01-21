"""Custom exceptions for the backend application."""


class BackendException(Exception):
    """Base exception for all backend errors."""

    pass


class DatabaseError(BackendException):
    """Raised when database operations fail."""

    pass


class ExternalAPIError(BackendException):
    """Raised when external API calls fail."""

    pass


class AIServiceError(BackendException):
    """Raised when AI service operations fail."""

    pass


class ValidationError(BackendException):
    """Raised when data validation fails."""

    pass


class PDFProcessingError(BackendException):
    """Raised when PDF processing fails."""

    pass


class FileOperationError(BackendException):
    """Raised when file operations fail."""

    pass
