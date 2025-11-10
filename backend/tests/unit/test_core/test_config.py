"""Tests for core configuration module."""

import os
from unittest.mock import patch

import pytest

from app.core.config import check_environment, REQUIRED_ENV_VARS


class TestConfig:
    """Test configuration validation functions."""

    def test_environment_variables_all_present_returns_true(self):
        """Test that check_environment returns True when all required env vars are present."""
        # Arrange
        env_vars = {
            "BASIC_URL": "https://api.sejm.gov.pl",
            "DU_URL": "https://api.sejm.gov.pl/du",
            "DATABASE_URL": "postgresql://user:pass@localhost:5432/db",
            "OPENAI_API_KEY": "sk-test-key-123",
        }

        # Act
        with patch.dict(os.environ, env_vars, clear=True):
            result = check_environment()

        # Assert
        assert result is True

    def test_environment_variables_missing_any_required_returns_false(self):
        """Test that check_environment returns False when any required env var is missing."""
        # Test single missing variable - parametrized
        test_cases = [
            ("BASIC_URL", {"DU_URL": "https://api.sejm.gov.pl/du", "DATABASE_URL": "postgresql://test", "OPENAI_API_KEY": "sk-test"}),
            ("DU_URL", {"BASIC_URL": "https://api.sejm.gov.pl", "DATABASE_URL": "postgresql://test", "OPENAI_API_KEY": "sk-test"}),
            ("DATABASE_URL", {"BASIC_URL": "https://api.sejm.gov.pl", "DU_URL": "https://api.sejm.gov.pl/du", "OPENAI_API_KEY": "sk-test"}),
            ("OPENAI_API_KEY", {"BASIC_URL": "https://api.sejm.gov.pl", "DU_URL": "https://api.sejm.gov.pl/du", "DATABASE_URL": "postgresql://test"}),
        ]

        for missing_var, env_vars in test_cases:
            with patch.dict(os.environ, env_vars, clear=True):
                result = check_environment()
                assert result is False, f"Should return False when {missing_var} is missing"

    def test_environment_variables_empty_values_treated_as_missing(self):
        """Test that empty environment variable values are treated as missing."""
        # Arrange
        env_vars = {
            "BASIC_URL": "",
            "DU_URL": "https://api.sejm.gov.pl/du",
            "DATABASE_URL": "postgresql://user:pass@localhost:5432/db",
            "OPENAI_API_KEY": "sk-test-key-123",
        }

        # Act
        with patch.dict(os.environ, env_vars, clear=True):
            result = check_environment()

        # Assert
        assert result is False

    def test_environment_variables_multiple_missing_returns_false(self):
        """Test that check_environment returns False when multiple env vars are missing."""
        # Arrange - only one var present out of four required
        env_vars = {
            "BASIC_URL": "https://api.sejm.gov.pl",
            # DU_URL, DATABASE_URL, OPENAI_API_KEY are missing
        }

        # Act
        with patch.dict(os.environ, env_vars, clear=True):
            result = check_environment()

        # Assert
        assert result is False
