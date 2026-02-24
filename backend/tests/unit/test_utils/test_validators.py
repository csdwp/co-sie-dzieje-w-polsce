"""Tests for validation utilities."""

from app.utils.validators import validate_act_data, validate_eli_format, validate_keywords


class TestValidateEliFormat:
    """Test validate_eli_format function."""

    def test_validate_eli_format_valid_eli_returns_true(self):
        """Test that validate_eli_format returns True for valid ELI."""
        # Arrange - test representative valid cases
        valid_elis = [
            "DU/2026/137",   # basic format
            "DU/2024/456",   # different year
            "MP/2025/50",    # different publisher
        ]

        # Act & Assert
        for eli in valid_elis:
            assert validate_eli_format(eli) is True

    def test_validate_eli_format_invalid_eli_returns_false(self):
        """Test that validate_eli_format returns False for invalid ELI."""
        # Arrange - test key invalid cases
        invalid_elis = [
            "",                # empty string
            "not-an-eli",     # wrong format
            "DU/2024",        # missing number part
            "DU/abcd/123",    # non-numeric year
            "DU/2024/abc",    # non-numeric number
            "DU//2026",       # missing year
        ]

        # Act & Assert
        for eli in invalid_elis:
            assert validate_eli_format(eli) is False

    def test_validate_eli_format_non_string_returns_false(self):
        """Test that validate_eli_format returns False for non-string inputs."""
        # Arrange - test key non-string types
        non_string_inputs = [None, 123]

        # Act & Assert
        for invalid_input in non_string_inputs:
            assert validate_eli_format(invalid_input) is False


class TestValidateActData:
    """Test validate_act_data function."""

    def test_validate_act_data_complete_data_returns_true(self):
        """Test that validate_act_data returns True for complete valid data."""
        # Arrange
        valid_data = {
            "ELI": "DU/2024/123",
            "title": "Ustawa testowa",
            "type": "Ustawa"
        }

        # Act
        result = validate_act_data(valid_data)

        # Assert
        assert result is True

    def test_validate_act_data_invalid_required_fields_returns_false(self):
        """Test that validate_act_data returns False when required fields are missing or empty."""
        # Arrange - test missing and empty required fields
        test_cases = [
            # Missing fields
            {"title": "Ustawa testowa", "type": "Ustawa"},  # missing ELI
            {"ELI": "DU/2024/123", "type": "Ustawa"},  # missing title
            {"ELI": "DU/2024/123", "title": "Ustawa testowa"},  # missing type
            # Empty fields
            {"ELI": "", "title": "Ustawa testowa", "type": "Ustawa"},  # empty ELI
            {"ELI": "DU/2024/123", "title": "", "type": "Ustawa"},  # empty title
            {"ELI": "DU/2024/123", "title": "Ustawa testowa", "type": ""},  # empty type
        ]

        # Act & Assert
        for invalid_data in test_cases:
            result = validate_act_data(invalid_data)
            assert result is False

    def test_validate_act_data_invalid_eli_format_returns_false(self):
        """Test that validate_act_data returns False for invalid ELI format."""
        # Arrange
        invalid_data = {
            "ELI": "invalid-eli-format",
            "title": "Ustawa testowa",
            "type": "Ustawa"
        }

        # Act
        result = validate_act_data(invalid_data)

        # Assert
        assert result is False

    def test_validate_act_data_invalid_type_returns_false(self):
        """Test that validate_act_data returns False for invalid act type."""
        # Arrange
        invalid_data = {
            "ELI": "DU/2024/123",
            "title": "Ustawa testowa",
            "type": "InvalidType"
        }

        # Act
        result = validate_act_data(invalid_data)

        # Assert
        assert result is False

    def test_validate_act_data_valid_types_accepted(self):
        """Test that validate_act_data accepts valid act types."""
        # Arrange
        valid_types = ["Ustawa", "Rozporządzenie"]

        for act_type in valid_types:
            data = {
                "ELI": "DU/2024/123",
                "title": "Ustawa testowa",
                "type": act_type
            }

            # Act
            result = validate_act_data(data)

            # Assert
            assert result is True, f"Type '{act_type}' should be accepted"


class TestValidateKeywords:
    """Test validate_keywords function."""

    def test_validate_keywords_none_returns_true(self):
        """Test that validate_keywords returns True for None input."""
        # Act
        result = validate_keywords(None)

        # Assert
        assert result is True

    def test_validate_keywords_empty_list_returns_true(self):
        """Test that validate_keywords returns True for empty list."""
        # Act
        result = validate_keywords([])

        # Assert
        assert result is True

    def test_validate_keywords_valid_string_list_returns_true(self):
        """Test that validate_keywords returns True for valid string list."""
        # Arrange
        valid_keywords = [
            ["prawo", "zdrowie"],
            ["test", "automatyzacja", "python"],
            ["single"]
        ]

        # Act & Assert
        for keywords in valid_keywords:
            result = validate_keywords(keywords)
            assert result is True

    def test_validate_keywords_non_list_returns_false(self):
        """Test that validate_keywords returns False for non-list inputs."""
        # Arrange - test key non-list types
        non_list_inputs = ["string", 123]

        # Act & Assert
        for invalid_input in non_list_inputs:
            result = validate_keywords(invalid_input)
            assert result is False

    def test_validate_keywords_invalid_content_returns_false(self):
        """Test that validate_keywords returns False when list contains non-strings."""
        # Arrange - test various invalid keyword contents
        invalid_keywords = [
            ["prawo", 123, "zdrowie"],     # mixed types
            ["test", None, "python"],      # None values
            [123, 456],                    # all numeric
            ["valid", [], "strings"]       # list in list
        ]

        # Act & Assert
        for invalid_kw in invalid_keywords:
            result = validate_keywords(invalid_kw)
            assert result is False
