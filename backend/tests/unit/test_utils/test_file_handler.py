"""Tests for file handling utilities."""

import json
from pathlib import Path
from unittest.mock import patch, mock_open

import pytest

from app.core.exceptions import FileOperationError
from app.utils.file_handler import FileHandler


class TestFileHandlerReadJson:
    """Test FileHandler.read_json method."""

    def test_read_json_existing_file_returns_data(self, tmp_path):
        """Test that read_json returns data when file exists."""
        # Arrange
        test_file = tmp_path / "test.json"
        test_data = {"key": "value", "number": 123}
        test_file.write_text(json.dumps(test_data), encoding="utf-8")

        # Act
        result = FileHandler.read_json(test_file)

        # Assert
        assert result == test_data

    def test_read_json_nonexistent_file_returns_none(self, tmp_path):
        """Test that read_json returns None when file doesn't exist."""
        # Arrange
        test_file = tmp_path / "nonexistent.json"

        # Act
        result = FileHandler.read_json(test_file)

        # Assert
        assert result is None

    def test_read_json_invalid_json_raises_exception(self, tmp_path):
        """Test that read_json raises FileOperationError for invalid JSON."""
        # Arrange
        test_file = tmp_path / "invalid.json"
        test_file.write_text("not valid json{", encoding="utf-8")

        # Act & Assert
        with pytest.raises(FileOperationError, match="Failed to read JSON file"):
            FileHandler.read_json(test_file)

    def test_read_json_non_dict_content_returns_none(self, tmp_path):
        """Test that read_json returns None when JSON is not a dict."""
        # Arrange
        test_file = tmp_path / "list.json"
        test_file.write_text(json.dumps(["a", "b", "c"]), encoding="utf-8")

        # Act
        result = FileHandler.read_json(test_file)

        # Assert
        assert result is None

    def test_read_json_empty_dict_returns_empty_dict(self, tmp_path):
        """Test that read_json returns empty dict for empty JSON object."""
        # Arrange
        test_file = tmp_path / "empty.json"
        test_file.write_text("{}", encoding="utf-8")

        # Act
        result = FileHandler.read_json(test_file)

        # Assert
        assert result == {}


class TestFileHandlerWriteJson:
    """Test FileHandler.write_json method."""

    def test_write_json_creates_file_with_correct_content(self, tmp_path):
        """Test that write_json creates file with correct content."""
        # Arrange
        test_file = tmp_path / "output.json"
        test_data = {"name": "Test", "value": 42}

        # Act
        result = FileHandler.write_json(test_file, test_data)

        # Assert
        assert result is True
        assert test_file.exists()
        
        # Verify content
        with open(test_file, "r", encoding="utf-8") as f:
            saved_data = json.load(f)
        assert saved_data == test_data

    def test_write_json_creates_parent_directories(self, tmp_path):
        """Test that write_json creates parent directories if they don't exist."""
        # Arrange
        test_file = tmp_path / "nested" / "dirs" / "output.json"
        test_data = {"test": "data"}

        # Act
        result = FileHandler.write_json(test_file, test_data)

        # Assert
        assert result is True
        assert test_file.exists()
        assert test_file.parent.exists()

    def test_write_json_overwrites_existing_file(self, tmp_path):
        """Test that write_json overwrites existing file."""
        # Arrange
        test_file = tmp_path / "overwrite.json"
        old_data = {"old": "data"}
        new_data = {"new": "data"}
        
        test_file.write_text(json.dumps(old_data), encoding="utf-8")

        # Act
        result = FileHandler.write_json(test_file, new_data)

        # Assert
        assert result is True
        with open(test_file, "r", encoding="utf-8") as f:
            saved_data = json.load(f)
        assert saved_data == new_data
        assert saved_data != old_data

    def test_write_json_handles_polish_characters(self, tmp_path):
        """Test that write_json correctly handles Polish characters."""
        # Arrange
        test_file = tmp_path / "polish.json"
        test_data = {"text": "Zażółć gęślą jaźń", "city": "Kraków"}

        # Act
        result = FileHandler.write_json(test_file, test_data)

        # Assert
        assert result is True
        with open(test_file, "r", encoding="utf-8") as f:
            saved_data = json.load(f)
        assert saved_data == test_data

    def test_write_json_io_error_raises_exception(self, tmp_path):
        """Test that write_json raises FileOperationError on IO error."""
        # Arrange
        test_file = tmp_path / "readonly.json"
        test_data = {"test": "data"}
        
        # Create file and make it read-only
        test_file.write_text("{}", encoding="utf-8")
        test_file.chmod(0o444)

        # Act & Assert
        try:
            with pytest.raises(FileOperationError, match="Failed to write JSON file"):
                FileHandler.write_json(test_file, test_data)
        finally:
            # Cleanup: restore write permissions
            test_file.chmod(0o644)


class TestFileHandlerReadText:
    """Test FileHandler.read_text method."""

    def test_read_text_existing_file_returns_content(self, tmp_path):
        """Test that read_text returns content when file exists."""
        # Arrange
        test_file = tmp_path / "test.txt"
        test_content = "This is test content\nWith multiple lines"
        test_file.write_text(test_content, encoding="utf-8")

        # Act
        result = FileHandler.read_text(test_file)

        # Assert
        assert result == test_content

    def test_read_text_nonexistent_file_returns_none(self, tmp_path):
        """Test that read_text returns None when file doesn't exist."""
        # Arrange
        test_file = tmp_path / "nonexistent.txt"

        # Act
        result = FileHandler.read_text(test_file)

        # Assert
        assert result is None

    def test_read_text_empty_file_returns_empty_string(self, tmp_path):
        """Test that read_text returns empty string for empty file."""
        # Arrange
        test_file = tmp_path / "empty.txt"
        test_file.write_text("", encoding="utf-8")

        # Act
        result = FileHandler.read_text(test_file)

        # Assert
        assert result == ""

    def test_read_text_handles_polish_characters(self, tmp_path):
        """Test that read_text correctly handles Polish characters."""
        # Arrange
        test_file = tmp_path / "polish.txt"
        test_content = "Zażółć gęślą jaźń\nŁódź, Kraków, Gdańsk"
        test_file.write_text(test_content, encoding="utf-8")

        # Act
        result = FileHandler.read_text(test_file)

        # Assert
        assert result == test_content


class TestFileHandlerWriteText:
    """Test FileHandler.write_text method."""

    def test_write_text_creates_file_with_content(self, tmp_path):
        """Test that write_text creates file with correct content."""
        # Arrange
        test_file = tmp_path / "output.txt"
        test_content = "Test content\nLine 2"

        # Act
        result = FileHandler.write_text(test_file, test_content)

        # Assert
        assert result is True
        assert test_file.exists()
        assert test_file.read_text(encoding="utf-8") == test_content

    def test_write_text_creates_parent_directories(self, tmp_path):
        """Test that write_text creates parent directories if they don't exist."""
        # Arrange
        test_file = tmp_path / "nested" / "output.txt"
        test_content = "Test"

        # Act
        result = FileHandler.write_text(test_file, test_content)

        # Assert
        assert result is True
        assert test_file.exists()

    def test_write_text_overwrites_existing_file(self, tmp_path):
        """Test that write_text overwrites existing file."""
        # Arrange
        test_file = tmp_path / "overwrite.txt"
        test_file.write_text("Old content", encoding="utf-8")
        new_content = "New content"

        # Act
        result = FileHandler.write_text(test_file, new_content)

        # Assert
        assert result is True
        assert test_file.read_text(encoding="utf-8") == new_content


class TestFileHandlerReadLines:
    """Test FileHandler.read_lines method."""

    def test_read_lines_returns_list_of_strings(self, tmp_path):
        """Test that read_lines returns list of stripped lines."""
        # Arrange
        test_file = tmp_path / "lines.txt"
        test_file.write_text("line1\nline2\nline3\n", encoding="utf-8")

        # Act
        result = FileHandler.read_lines(test_file)

        # Assert
        assert result == ["line1", "line2", "line3"]
        assert isinstance(result, list)
        assert all(isinstance(line, str) for line in result)

    def test_read_lines_strips_whitespace(self, tmp_path):
        """Test that read_lines strips whitespace from lines."""
        # Arrange
        test_file = tmp_path / "whitespace.txt"
        test_file.write_text("  line1  \n\tline2\t\n  line3\n", encoding="utf-8")

        # Act
        result = FileHandler.read_lines(test_file)

        # Assert
        assert result == ["line1", "line2", "line3"]

    def test_read_lines_nonexistent_file_returns_empty_list(self, tmp_path):
        """Test that read_lines returns empty list when file doesn't exist."""
        # Arrange
        test_file = tmp_path / "nonexistent.txt"

        # Act
        result = FileHandler.read_lines(test_file)

        # Assert
        assert result == []

    def test_read_lines_empty_file_returns_empty_list(self, tmp_path):
        """Test that read_lines returns empty list for empty file."""
        # Arrange
        test_file = tmp_path / "empty.txt"
        test_file.write_text("", encoding="utf-8")

        # Act
        result = FileHandler.read_lines(test_file)

        # Assert
        assert result == []

    def test_read_lines_handles_empty_lines(self, tmp_path):
        """Test that read_lines filters out empty lines after stripping."""
        # Arrange
        test_file = tmp_path / "empty_lines.txt"
        test_file.write_text("line1\n\nline2\n  \nline3", encoding="utf-8")

        # Act
        result = FileHandler.read_lines(test_file)

        # Assert
        # Empty lines after stripping become empty strings
        assert "line1" in result
        assert "line2" in result
        assert "line3" in result


class TestFileHandlerWriteLines:
    """Test FileHandler.write_lines method."""

    def test_write_lines_creates_file_with_newlines(self, tmp_path):
        """Test that write_lines creates file with lines separated by newlines."""
        # Arrange
        test_file = tmp_path / "lines.txt"
        lines = ["line1", "line2", "line3"]

        # Act
        result = FileHandler.write_lines(test_file, lines)

        # Assert
        assert result is True
        assert test_file.exists()
        content = test_file.read_text(encoding="utf-8")
        assert content == "line1\nline2\nline3\n"

    def test_write_lines_creates_parent_directories(self, tmp_path):
        """Test that write_lines creates parent directories if needed."""
        # Arrange
        test_file = tmp_path / "nested" / "lines.txt"
        lines = ["test"]

        # Act
        result = FileHandler.write_lines(test_file, lines)

        # Assert
        assert result is True
        assert test_file.exists()

    def test_write_lines_empty_list_creates_empty_file(self, tmp_path):
        """Test that write_lines with empty list creates empty file."""
        # Arrange
        test_file = tmp_path / "empty.txt"
        lines = []

        # Act
        result = FileHandler.write_lines(test_file, lines)

        # Assert
        assert result is True
        assert test_file.exists()
        assert test_file.read_text(encoding="utf-8") == ""

    def test_write_lines_overwrites_existing_file(self, tmp_path):
        """Test that write_lines overwrites existing file."""
        # Arrange
        test_file = tmp_path / "overwrite.txt"
        test_file.write_text("old content", encoding="utf-8")
        new_lines = ["new1", "new2"]

        # Act
        result = FileHandler.write_lines(test_file, new_lines)

        # Assert
        assert result is True
        assert test_file.read_text(encoding="utf-8") == "new1\nnew2\n"


class TestFileHandlerAppendLine:
    """Test FileHandler.append_line method."""

    def test_append_line_adds_to_existing_file(self, tmp_path):
        """Test that append_line adds line to existing file."""
        # Arrange
        test_file = tmp_path / "append.txt"
        test_file.write_text("line1\nline2\n", encoding="utf-8")

        # Act
        result = FileHandler.append_line(test_file, "line3")

        # Assert
        assert result is True
        content = test_file.read_text(encoding="utf-8")
        assert content == "line1\nline2\nline3\n"

    def test_append_line_creates_file_if_not_exists(self, tmp_path):
        """Test that append_line creates file if it doesn't exist."""
        # Arrange
        test_file = tmp_path / "new.txt"

        # Act
        result = FileHandler.append_line(test_file, "first line")

        # Assert
        assert result is True
        assert test_file.exists()
        assert test_file.read_text(encoding="utf-8") == "first line\n"

    def test_append_line_creates_parent_directories(self, tmp_path):
        """Test that append_line creates parent directories if needed."""
        # Arrange
        test_file = tmp_path / "nested" / "append.txt"

        # Act
        result = FileHandler.append_line(test_file, "test")

        # Assert
        assert result is True
        assert test_file.exists()

    def test_append_line_multiple_appends(self, tmp_path):
        """Test multiple appends work correctly."""
        # Arrange
        test_file = tmp_path / "multiple.txt"

        # Act
        FileHandler.append_line(test_file, "line1")
        FileHandler.append_line(test_file, "line2")
        result = FileHandler.append_line(test_file, "line3")

        # Assert
        assert result is True
        content = test_file.read_text(encoding="utf-8")
        assert content == "line1\nline2\nline3\n"

