"""Tests for custom exception hierarchy."""

import pytest

from app.core.exceptions import (
    AIServiceError,
    BackendException,
    DatabaseError,
    ExternalAPIError,
    FileOperationError,
    PDFProcessingError,
    ValidationError,
)


class TestExceptions:
    """Test custom exception hierarchy and inheritance."""

    def test_custom_exception_hierarchy_inheritance_correct(self):
        """Test that all custom exceptions inherit from BackendException."""
        # Test direct inheritance
        assert issubclass(DatabaseError, BackendException)
        assert issubclass(ExternalAPIError, BackendException)
        assert issubclass(AIServiceError, BackendException)
        assert issubclass(ValidationError, BackendException)
        assert issubclass(PDFProcessingError, BackendException)
        assert issubclass(FileOperationError, BackendException)

    def test_exception_instances_are_backend_exceptions(self):
        """Test that exception instances are instances of BackendException."""
        exceptions = [
            DatabaseError("Database connection failed"),
            ExternalAPIError("API call failed"),
            AIServiceError("AI service error"),
            ValidationError("Validation failed"),
            PDFProcessingError("PDF processing failed"),
            FileOperationError("File operation failed"),
        ]

        for exc in exceptions:
            assert isinstance(exc, BackendException)
            assert isinstance(exc, Exception)

    def test_exception_messages_contain_context(self):
        """Test that exceptions can be created with meaningful messages."""
        test_messages = [
            ("Database connection timeout", DatabaseError),
            ("API returned 500 status", ExternalAPIError),
            ("OpenAI API rate limit exceeded", AIServiceError),
            ("Invalid ELI format provided", ValidationError),
            ("Corrupted PDF file", PDFProcessingError),
            ("Permission denied writing to file", FileOperationError),
        ]

        for message, exc_class in test_messages:
            exc = exc_class(message)
            assert str(exc) == message
            assert exc.__class__.__name__ in str(exc.__class__)

    def test_exceptions_can_be_raised_and_caught(self):
        """Test that exceptions can be raised and caught properly."""
        with pytest.raises(DatabaseError):
            raise DatabaseError("Test database error")

        with pytest.raises(ExternalAPIError):
            raise ExternalAPIError("Test API error")

        with pytest.raises(BackendException):
            # Should catch any BackendException subclass
            raise ValidationError("Test validation error")

    def test_exception_hierarchy_allows_specific_catching(self):
        """Test that more specific exceptions can be caught before general ones."""
        def test_function(raise_specific=True):
            if raise_specific:
                raise DatabaseError("Specific database error")
            else:
                raise BackendException("General backend error")

        # Test catching specific exception
        with pytest.raises(DatabaseError):
            test_function(raise_specific=True)

        # Test catching general exception
        with pytest.raises(BackendException):
            test_function(raise_specific=False)
