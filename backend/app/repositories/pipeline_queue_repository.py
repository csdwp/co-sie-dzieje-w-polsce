"""Repository for pipeline_queue table operations."""

from typing import List

from ..core.exceptions import DatabaseError
from ..core.logging import get_logger
from .base_repository import BaseRepository

logger = get_logger(__name__)


class PipelineQueueRepository(BaseRepository):
    """Repository for managing ELIs queued for later processing."""

    def add(self, eli: str) -> None:
        """
        Add an ELI to the queue.

        Args:
            eli: ELI to queue
        """
        query = """
        INSERT INTO pipeline_queue (eli) VALUES (%s)
        ON CONFLICT (eli) DO NOTHING
        """
        try:
            with self.get_connection() as (conn, cursor):
                cursor.execute(query, (eli,))
                conn.commit()
            logger.info(f"Queued ELI for later: {eli}")
        except Exception as e:
            logger.error(f"Error queuing ELI: {e}")
            raise DatabaseError(f"Failed to queue ELI: {e}")

    def get_all(self) -> List[str]:
        """
        Get all ELIs currently in the queue.

        Returns:
            List of ELIs ordered by added_at
        """
        query = "SELECT eli FROM pipeline_queue ORDER BY added_at ASC"
        try:
            with self.get_connection() as (_, cursor):
                cursor.execute(query)
                rows = cursor.fetchall()
            return [row[0] for row in rows]
        except Exception as e:
            logger.error(f"Error fetching queue: {e}")
            raise DatabaseError(f"Failed to fetch queue: {e}")

    def remove(self, eli: str) -> None:
        """
        Remove a processed ELI from the queue.

        Args:
            eli: ELI to remove
        """
        query = "DELETE FROM pipeline_queue WHERE eli = %s"
        try:
            with self.get_connection() as (conn, cursor):
                cursor.execute(query, (eli,))
                conn.commit()
            logger.info(f"Removed ELI from queue: {eli}")
        except Exception as e:
            logger.error(f"Error removing ELI from queue: {e}")
            raise DatabaseError(f"Failed to remove ELI: {e}")
