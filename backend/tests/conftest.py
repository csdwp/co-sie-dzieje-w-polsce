"""Global pytest configuration and fixtures."""

import pytest
from unittest.mock import patch


@pytest.fixture(autouse=True)
def mock_logger():
    """Auto-mock logger for all tests to reduce noise in test output."""
    with patch("app.core.logging.get_logger"):
        yield


@pytest.fixture
def sample_act_data():
    """Sample act data for testing."""
    return {
        "ELI": "/pl/act/dz/2024/123",
        "title": "Ustawa o zmianie ustawy testowej",
        "type": "Ustawa",
        "promulgation": "2024-01-15",
        "announcement_date": "2024-01-10",
        "status": "obowiązujący",
        "keywords": ["test", "prawo"],
    }


@pytest.fixture
def sample_acts_list():
    """Sample list of acts for testing."""
    return [
        {
            "ELI": "/pl/act/dz/2024/123",
            "title": "Ustawa testowa 1",
            "type": "Ustawa",
            "promulgation": "2024-03-15",
        },
        {
            "ELI": "/pl/act/dz/2024/456",
            "title": "Rozporządzenie testowe",
            "type": "Rozporządzenie",
            "promulgation": "2024-02-20",
        },
        {
            "ELI": "/pl/act/dz/2024/789",
            "title": "Ustawa testowa 2",
            "type": "Ustawa",
            "promulgation": "2024-01-10",
        },
    ]
