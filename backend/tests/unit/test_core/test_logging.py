"""Tests for core logging module."""

import logging
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

from app.core.logging import setup_logger, get_logger


class TestSetupLogger:
    """Test setup_logger function."""

    def test_setup_logger_creates_logger_with_correct_name(self):
        """Test that setup_logger creates a logger with the specified name."""
        # Act
        logger = setup_logger("test_logger")

        # Assert
        assert logger.name == "test_logger"
        assert isinstance(logger, logging.Logger)

    def test_setup_logger_creates_console_handler_by_default(self):
        """Test that setup_logger creates a console handler by default."""
        # Act
        logger = setup_logger("test_logger_console", force=True)

        # Assert
        assert len(logger.handlers) == 1
        handler = logger.handlers[0]
        assert isinstance(handler, logging.StreamHandler)
        assert handler.stream == sys.stdout

    def test_setup_logger_creates_file_handler_when_log_file_provided(self, tmp_path):
        """Test that setup_logger creates a file handler when log_file is provided."""
        # Arrange
        log_file = tmp_path / "test.log"

        # Act
        logger = setup_logger("test_logger_file", log_file=log_file, force=True)

        # Assert
        assert len(logger.handlers) == 2  # console + file

        # Find file handler
        file_handler = None
        console_handler = None
        for handler in logger.handlers:
            if isinstance(handler, logging.FileHandler):
                file_handler = handler
            elif isinstance(handler, logging.StreamHandler):
                console_handler = handler

        assert file_handler is not None
        assert console_handler is not None
        assert console_handler.stream == sys.stdout

    def test_setup_logger_sets_correct_level(self):
        """Test that setup_logger sets the correct logging level."""
        # Act
        logger = setup_logger("test_logger_level", level=logging.DEBUG, force=True)

        # Assert
        assert logger.level == logging.DEBUG
        assert logger.handlers[0].level == logging.DEBUG

    def test_setup_logger_uses_default_format_when_none_provided(self):
        """Test that setup_logger uses default format when format_string is None."""
        # Act
        logger = setup_logger("test_logger_default_format", force=True)

        # Assert
        formatter = logger.handlers[0].formatter
        expected_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        assert formatter._fmt == expected_format

    def test_setup_logger_uses_custom_format_when_provided(self):
        """Test that setup_logger uses custom format when format_string is provided."""
        # Arrange
        custom_format = "%(levelname)s: %(message)s"

        # Act
        logger = setup_logger("test_logger_custom_format", format_string=custom_format, force=True)

        # Assert
        formatter = logger.handlers[0].formatter
        assert formatter._fmt == custom_format

    def test_setup_logger_avoids_duplicate_handlers(self):
        """Test that setup_logger avoids adding duplicate handlers."""
        # Act - call setup_logger multiple times with same name
        logger1 = setup_logger("test_logger_duplicate")
        logger2 = setup_logger("test_logger_duplicate")  # Same name

        # Assert - should be same logger instance
        assert logger1 is logger2
        assert len(logger1.handlers) == 1  # Not duplicated

    def test_setup_logger_file_handler_uses_utf8_encoding(self, tmp_path):
        """Test that file handler uses UTF-8 encoding."""
        # Arrange
        log_file = tmp_path / "test.log"

        # Act
        logger = setup_logger("test_logger_encoding", log_file=log_file, force=True)

        # Assert
        file_handler = None
        for handler in logger.handlers:
            if isinstance(handler, logging.FileHandler):
                file_handler = handler
                break

        assert file_handler is not None
        assert file_handler.encoding == "utf-8"


class TestGetLogger:
    """Test get_logger function."""

    @patch('app.core.logging.setup_logger')
    def test_get_logger_calls_setup_logger_with_correct_params_and_returns_logger(self, mock_setup_logger):
        """Test that get_logger calls setup_logger with correct parameters and returns logger instance."""
        # Arrange
        mock_logger = MagicMock()
        mock_setup_logger.return_value = mock_logger

        # Act
        result = get_logger("test_module")

        # Assert
        mock_setup_logger.assert_called_once()
        args, kwargs = mock_setup_logger.call_args
        assert args[0] == "test_module"  # name
        assert isinstance(kwargs['log_file'], Path)
        assert str(kwargs['log_file']).endswith("logs/app.log")
        assert result is mock_logger

        # Also test actual functionality without mock
        actual_logger = get_logger("another_module_get_logger")
        assert isinstance(actual_logger, logging.Logger)
        assert actual_logger.name == "another_module_get_logger"
