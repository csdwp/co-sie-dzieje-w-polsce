"""Base repository with database connection management."""

import os
from contextlib import contextmanager
from typing import Any, Generator, Optional, Tuple

import psycopg2
from dotenv import load_dotenv

from ..core.exceptions import DatabaseError
from ..core.logging import get_logger

logger = get_logger(__name__)
load_dotenv()


class BaseRepository:
    """Base repository class for database operations."""

    def __init__(self, connection_string: Optional[str] = None):
        """
        Initialize repository.

        Args:
            connection_string: Database connection string (default: from env)
        """
        self.connection_string = connection_string or os.getenv("DATABASE_URL")
        if not self.connection_string:
            raise DatabaseError("DATABASE_URL is not set in environment variables")

    @contextmanager
    def get_connection(self) -> Generator[Tuple[Any, Any], None, None]:
        """
        Get database connection and cursor.

        Yields:
            Tuple of (connection, cursor)

        Raises:
            DatabaseError: If connection fails
        """
        conn = None
        cursor = None
        try:
            conn = psycopg2.connect(self.connection_string)
            cursor = conn.cursor()
            yield conn, cursor
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {e}")
            raise DatabaseError(f"Database operation failed: {e}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
