"""Repository for pipeline_queue table operations."""

from typing import List

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
        with self.get_connection() as (conn, cursor):
            cursor.execute(query, (eli,))
            conn.commit()
        logger.info(f"Queued ELI for later: {eli}")

    def get_all(self) -> List[str]:
        """
        Get all ELIs currently in the queue.

        Returns:
            List of ELIs ordered by added_at
        """
        query = "SELECT eli FROM pipeline_queue ORDER BY added_at ASC"
        with self.get_connection() as (conn, cursor):
            cursor.execute(query)
            rows = cursor.fetchall()
        return [row[0] for row in rows]

    def remove(self, eli: str) -> None:
        """
        Remove a processed ELI from the queue.

        Args:
            eli: ELI to remove
        """
        query = "DELETE FROM pipeline_queue WHERE eli = %s"
        with self.get_connection() as (conn, cursor):
            cursor.execute(query, (eli,))
            conn.commit()
        logger.info(f"Removed ELI from queue: {eli}")
