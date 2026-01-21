"""File handling utilities for JSON and text files."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..core.exceptions import FileOperationError
from ..core.logging import get_logger

logger = get_logger(__name__)


class FileHandler:
    """Handles file operations for the application."""

    @staticmethod
    def read_json(file_path: Path) -> Optional[Dict[str, Any]]:
        """
        Read JSON file.

        Args:
            file_path: Path to JSON file

        Returns:
            Dictionary with file contents or None if error
        """
        try:
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                return None

            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, dict) else None
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error reading JSON file {file_path}: {e}")
            raise FileOperationError(f"Failed to read JSON file: {e}")

    @staticmethod
    def write_json(file_path: Path, data: Dict[str, Any]) -> bool:
        """
        Write data to JSON file.

        Args:
            file_path: Path to JSON file
            data: Data to write

        Returns:
            True if successful, False otherwise
        """
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"Successfully wrote JSON to {file_path}")
            return True
        except IOError as e:
            logger.error(f"Error writing JSON file {file_path}: {e}")
            raise FileOperationError(f"Failed to write JSON file: {e}")

    @staticmethod
    def read_text(file_path: Path) -> Optional[str]:
        """
        Read text file.

        Args:
            file_path: Path to text file

        Returns:
            File contents as string or None if error
        """
        try:
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                return None

            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except IOError as e:
            logger.error(f"Error reading text file {file_path}: {e}")
            raise FileOperationError(f"Failed to read text file: {e}")

    @staticmethod
    def write_text(file_path: Path, content: str) -> bool:
        """
        Write text to file.

        Args:
            file_path: Path to text file
            content: Text content to write

        Returns:
            True if successful
        """
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            logger.info(f"Successfully wrote text to {file_path}")
            return True
        except IOError as e:
            logger.error(f"Error writing text file {file_path}: {e}")
            raise FileOperationError(f"Failed to write text file: {e}")

    @staticmethod
    def read_lines(file_path: Path) -> List[str]:
        """
        Read file as list of lines.

        Args:
            file_path: Path to file

        Returns:
            List of lines (stripped)
        """
        try:
            if not file_path.exists():
                return []

            with open(file_path, "r", encoding="utf-8") as f:
                return [line.strip() for line in f.readlines()]
        except IOError as e:
            logger.error(f"Error reading lines from {file_path}: {e}")
            raise FileOperationError(f"Failed to read lines: {e}")

    @staticmethod
    def write_lines(file_path: Path, lines: List[str]) -> bool:
        """
        Write list of lines to file.

        Args:
            file_path: Path to file
            lines: List of lines to write

        Returns:
            True if successful
        """
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                for line in lines:
                    f.write(f"{line}\n")
            logger.info(f"Successfully wrote {len(lines)} lines to {file_path}")
            return True
        except IOError as e:
            logger.error(f"Error writing lines to {file_path}: {e}")
            raise FileOperationError(f"Failed to write lines: {e}")

    @staticmethod
    def append_line(file_path: Path, line: str) -> bool:
        """
        Append a single line to file.

        Args:
            file_path: Path to file
            line: Line to append

        Returns:
            True if successful
        """
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "a", encoding="utf-8") as f:
                f.write(f"{line}\n")
            return True
        except IOError as e:
            logger.error(f"Error appending to {file_path}: {e}")
            raise FileOperationError(f"Failed to append line: {e}")
