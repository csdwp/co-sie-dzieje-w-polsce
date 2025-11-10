"""Unit tests for SejmAPIClient.fetch_acts_for_year()"""

import json
import pytest
import requests
from unittest.mock import Mock, patch

from app.services.external.sejm_api import SejmAPIClient
from app.core.exceptions import ExternalAPIError


class TestSejmAPIClientFetchActsForYear:
    """Unit tests for SejmAPIClient.fetch_acts_for_year()"""

    @pytest.fixture
    def sejm_client(self):
        """Create SejmAPIClient with mocked environment variables"""
        with patch("app.core.config.BASIC_URL", "https://api.sejm.gov.pl/eli"):
            with patch("app.core.config.API_URL", "https://api.sejm.gov.pl/sejm/term10/acts"):
                yield SejmAPIClient()

    def test_fetch_acts_for_year_missing_env_variables_raises_exception(self):
        """Test initialization fails when env vars missing"""
        with patch("app.services.external.sejm_api.BASIC_URL", None):
            with patch("app.services.external.sejm_api.API_URL", None):
                with pytest.raises(ExternalAPIError, match="is not set"):
                    SejmAPIClient()

    def test_fetch_acts_for_year_network_unavailable_raises_exception(
        self, sejm_client
    ):
        """Test network connection error handling"""
        with patch(
            "requests.get",
            side_effect=requests.exceptions.ConnectionError("Network unavailable"),
        ):
            with pytest.raises(ExternalAPIError):
                sejm_client.fetch_acts_for_year(2024)

    def test_fetch_acts_for_year_timeout_raises_exception(self, sejm_client):
        """Test timeout handling"""
        with patch(
            "requests.get", side_effect=requests.exceptions.Timeout("Request timed out")
        ):
            with pytest.raises(ExternalAPIError):
                sejm_client.fetch_acts_for_year(2024)

    def test_fetch_acts_for_year_malformed_json_response_raises_exception(
        self, sejm_client
    ):
        """Test malformed JSON response handling"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.side_effect = json.JSONDecodeError(
            "Expecting value", "doc", 0
        )

        with patch("requests.get", return_value=mock_response):
            with pytest.raises(json.JSONDecodeError):
                sejm_client.fetch_acts_for_year(2024)

    def test_fetch_acts_for_year_http_500_error_raises_exception(self, sejm_client):
        """Test HTTP 500 server error handling"""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError(
            "500 Server Error"
        )

        with patch("requests.get", return_value=mock_response):
            with pytest.raises(ExternalAPIError, match="HTTP error: 500"):
                sejm_client.fetch_acts_for_year(2024)
