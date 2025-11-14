"""Tests for retry handler decorators."""

from unittest.mock import Mock
import pytest
import requests
from openai import APIError
from tenacity import RetryError
import httpx

from app.utils.retry_handler import retry_external_api, retry_ai_service


class TestRetryExternalApi:
    """Test retry_external_api decorator."""

    def test_retry_decorator_succeeds_on_first_attempt(self):
        """Test that function succeeds without retry on first attempt."""
        # Arrange
        mock_func = Mock(return_value="success")
        decorated = retry_external_api(mock_func)

        # Act
        result = decorated()

        # Assert
        assert result == "success"
        assert mock_func.call_count == 1

    @pytest.mark.parametrize("exception", [
        requests.exceptions.Timeout("Timeout"),
        requests.exceptions.ConnectionError("Connection"),
        requests.exceptions.RequestException("Request"),
    ])
    def test_retries_on_network_errors(self, exception):
        """Test that decorator retries on various network errors then succeeds."""
        # Arrange
        mock_func = Mock(
            __name__="mock_func",
            side_effect=[exception, "success"]
        )
        decorated = retry_external_api(mock_func)

        # Act
        result = decorated()

        # Assert
        assert result == "success"
        assert mock_func.call_count == 2

    def test_retry_decorator_fails_after_max_attempts(self):
        """Test that decorator fails after 3 attempts."""
        # Arrange
        mock_func = Mock(
            __name__="mock_func",
            side_effect=requests.exceptions.Timeout("Timeout")
        )
        decorated = retry_external_api(mock_func)

        # Act & Assert
        with pytest.raises(RetryError):
            decorated()
        
        assert mock_func.call_count == 3

    def test_retry_decorator_does_not_retry_on_other_exceptions(self):
        """Test that decorator does not retry on non-network exceptions."""
        # Arrange
        mock_func = Mock(side_effect=ValueError("Not a network error"))
        decorated = retry_external_api(mock_func)

        # Act & Assert
        with pytest.raises(ValueError, match="Not a network error"):
            decorated()
        
        # Should not retry
        assert mock_func.call_count == 1

    def test_retry_decorator_with_function_arguments(self):
        """Test that decorator works with function arguments."""
        # Arrange
        mock_func = Mock(
            __name__="mock_func",
            side_effect=[
                requests.exceptions.Timeout("Timeout"),
                "success"
            ]
        )
        decorated = retry_external_api(mock_func)

        # Act
        result = decorated("arg1", kwarg1="value1")

        # Assert
        assert result == "success"
        assert mock_func.call_count == 2
        mock_func.assert_called_with("arg1", kwarg1="value1")


class TestRetryAiService:
    """Test retry_ai_service decorator."""

    @pytest.fixture
    def mock_api_error(self):
        """Create a mock APIError for testing."""
        mock_request = httpx.Request("POST", "https://api.openai.com/v1/chat/completions")
        return APIError("API Error", request=mock_request, body=None)

    def test_retry_ai_decorator_succeeds_on_first_attempt(self):
        """Test that AI service function succeeds without retry on first attempt."""
        # Arrange
        mock_func = Mock(return_value="ai_response")
        decorated = retry_ai_service(mock_func)

        # Act
        result = decorated()

        # Assert
        assert result == "ai_response"
        assert mock_func.call_count == 1

    def test_retry_ai_decorator_retries_on_api_error_then_succeeds(self, mock_api_error):
        """Test that decorator retries on APIError then succeeds."""
        # Arrange
        mock_func = Mock(
            __name__="mock_func",
            side_effect=[
                mock_api_error,
                mock_api_error,
                "success"
            ]
        )
        decorated = retry_ai_service(mock_func)

        # Act
        result = decorated()

        # Assert
        assert result == "success"
        assert mock_func.call_count == 3

    def test_retry_ai_decorator_fails_after_max_attempts(self, mock_api_error):
        """Test that decorator fails after 5 attempts for AI service."""
        # Arrange
        mock_func = Mock(
            __name__="mock_func",
            side_effect=mock_api_error
        )
        decorated = retry_ai_service(mock_func)

        # Act & Assert
        with pytest.raises(RetryError):
            decorated()
        
        # Should attempt 5 times
        assert mock_func.call_count == 5

    def test_retry_ai_decorator_does_not_retry_on_other_exceptions(self):
        """Test that AI decorator does not retry on non-API exceptions."""
        # Arrange
        mock_func = Mock(side_effect=ValueError("Not an API error"))
        decorated = retry_ai_service(mock_func)

        # Act & Assert
        with pytest.raises(ValueError, match="Not an API error"):
            decorated()
        
        # Should not retry
        assert mock_func.call_count == 1
