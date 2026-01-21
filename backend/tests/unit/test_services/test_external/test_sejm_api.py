"""Tests for SejmAPIClient."""

from unittest.mock import Mock, patch

import pytest
import requests

from app.core.exceptions import ExternalAPIError
from app.models.act import ActData
from app.services.external.sejm_api import SejmAPIClient


class TestSejmAPIClient:
    """Test SejmAPIClient functionality."""

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_acts_for_year_valid_year_returns_list(self, mock_get):
        """Test that fetch_acts_for_year returns list of acts for valid year."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"items": [{"eli": "/test/1", "title": "Test Act"}]}
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_acts_for_year(2023)

            # Assert
            assert result == [{"eli": "/test/1", "title": "Test Act"}]
            mock_get.assert_called_once_with("https://api.sejm.gov.pl/du/2023", timeout=10)

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_acts_for_year_default_current_year(self, mock_get):
        """Test that fetch_acts_for_year uses current year when none provided."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"items": []}
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_acts_for_year()  # No year provided

            # Assert
            mock_get.assert_called_once_with("https://api.sejm.gov.pl/du/2024", timeout=10)

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_acts_for_year_empty_response_returns_empty_list(self, mock_get):
        """Test that fetch_acts_for_year returns empty list when no items."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"items": []}
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_acts_for_year(2023)

            # Assert
            assert result == []

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_acts_for_year_invalid_response_returns_none(self, mock_get):
        """Test that fetch_acts_for_year returns None for invalid response."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = "invalid response"  # Not a dict
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_acts_for_year(2023)

            # Assert
            assert result is None

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_acts_for_year_no_items_key_returns_none(self, mock_get):
        """Test that fetch_acts_for_year returns None when no items key in response."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"other_key": "value"}  # No 'items' key
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_acts_for_year(2023)

            # Assert
            assert result == []

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_act_details_valid_data_returns_act_data(self, mock_get):
        """Test that fetch_act_details returns ActData for valid response."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "title": "Ustawa testowa",
            "type": "Ustawa",
            "promulgation": "2024-01-15",
            "announcementDate": "2024-01-10",
            "status": "obowiązujący",
            "keywords": ["prawo", "test"]
        }
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_act_details("/pl/act/dz/2024/123")

            # Assert
            assert isinstance(result, ActData)
            assert result.eli == "/pl/act/dz/2024/123"
            assert result.title == "Ustawa testowa"
            assert result.type == "Ustawa"
            assert result.promulgation == "2024-01-15"
            assert result.announcement_date == "2024-01-10"
            assert result.status == "obowiązujący"
            assert result.keywords == ["prawo", "test"]

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_act_details_invalid_response_returns_none(self, mock_get):
        """Test that fetch_act_details returns None for invalid response."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = "invalid response"  # Not a dict
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_act_details("/pl/act/dz/2024/123")

            # Assert
            assert result is None

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_act_details_missing_fields_handles_gracefully(self, mock_get):
        """Test that fetch_act_details handles missing fields gracefully."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "title": "Minimal Act"
            # Missing type, promulgation, etc.
        }
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_act_details("/pl/act/dz/2024/123")

            # Assert
            assert isinstance(result, ActData)
            assert result.eli == "/pl/act/dz/2024/123"
            assert result.title == "Minimal Act"
            assert result.type == ""  # Default empty string
            assert result.keywords == []  # Default empty list

    def test_get_pdf_url_constructs_correct_url(self):
        """Test that get_pdf_url constructs correct PDF URL."""
        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            url = client.get_pdf_url("/pl/act/dz/2024/123")

            # Assert
            assert url == "https://api.sejm.gov.pl/pl/act/dz/2024/123/text.pdf"

    def test_get_pdf_url_with_empty_eli_returns_url_with_empty_eli(self):
        """Test that get_pdf_url works with empty ELI (edge case)."""
        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            url = client.get_pdf_url("")

            # Assert
            assert url == "https://api.sejm.gov.pl/text.pdf"

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_voting_process_valid_data_returns_dict(self, mock_get):
        """Test that fetch_voting_process returns voting data for valid response."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"process": "data", "votes": 100}
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_voting_process("https://api.sejm.gov.pl/process/123")

            # Assert
            assert result == {"process": "data", "votes": 100}
            mock_get.assert_called_once_with("https://api.sejm.gov.pl/process/123", timeout=10)

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_voting_process_invalid_response_returns_none(self, mock_get):
        """Test that fetch_voting_process returns None for invalid response."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = "invalid"  # Not a dict
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_voting_process("https://api.sejm.gov.pl/process/123")

            # Assert
            assert result is None

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_sejm_voting_valid_params_returns_voting_data(self, mock_get):
        """Test that fetch_sejm_voting returns voting data for valid parameters."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {"voting": "details", "result": "passed"}
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_sejm_voting(term=10, sitting=15, voting_number=3)

            # Assert
            assert result == {"voting": "details", "result": "passed"}
            expected_url = "https://api.sejm.gov.pl/sejm/term10/votings/15/3"
            mock_get.assert_called_once_with(expected_url, timeout=10)

    @patch('app.services.external.sejm_api.requests.get')
    def test_fetch_sejm_voting_invalid_params_returns_none(self, mock_get):
        """Test that fetch_sejm_voting returns None for invalid response."""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = ["invalid", "array"]  # Not a dict
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client.fetch_sejm_voting(term=10, sitting=15, voting_number=3)

            # Assert
            assert result is None

    @patch('app.services.external.sejm_api.requests.get')
    @pytest.mark.slow
    def test_fetch_json_http_error_raises_external_api_error(self, mock_get):
        """Test that _fetch_json raises ExternalAPIError on HTTP error."""
        # Arrange
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("404")
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act & Assert
            with pytest.raises(ExternalAPIError, match="HTTP error: 404"):
                client._fetch_json("https://api.sejm.gov.pl/test")

    @patch('app.services.external.sejm_api.requests.get')
    @pytest.mark.slow
    def test_fetch_json_request_error_raises_external_api_error(self, mock_get):
        """Test that _fetch_json raises ExternalAPIError on request error."""
        # Arrange
        mock_get.side_effect = requests.exceptions.RequestException("Connection timeout")

        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act & Assert
            with pytest.raises(ExternalAPIError, match="Request failed: Connection timeout"):
                client._fetch_json("https://api.sejm.gov.pl/test")

    def test_fetch_json_empty_url_returns_none(self):
        """Test that _fetch_json returns None for empty URL."""
        with patch("app.services.external.sejm_api.BASIC_URL", "https://api.sejm.gov.pl"), \
             patch("app.services.external.sejm_api.API_URL", "https://api.sejm.gov.pl/du"), \
             patch("app.services.external.sejm_api.CURRENT_YEAR", 2024):

            client = SejmAPIClient()

            # Act
            result = client._fetch_json("")

            # Assert
            assert result is None
