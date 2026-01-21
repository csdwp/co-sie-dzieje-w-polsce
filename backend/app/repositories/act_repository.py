"""Repository for acts table operations."""

import json
from typing import Optional

from ..core.exceptions import DatabaseError
from ..core.logging import get_logger
from ..models.act import Act
from .base_repository import BaseRepository

logger = get_logger(__name__)


class ActRepository(BaseRepository):
    """Repository for acts data access."""

    def save_act(self, act: Act) -> bool:
        """
        Save an act to the database.

        Args:
            act: Act entity to save

        Returns:
            True if successful, False otherwise
        """
        insert_query = """
        INSERT INTO acts (
            title, act_number, simple_title, content, refs, texts, item_type,
            announcement_date, change_date, promulgation, item_status, comments,
            keywords, file, votes, category, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """

        try:
            # Serialize JSON fields
            refs = json.dumps(act.refs) if act.refs is not None else None
            texts = json.dumps(act.texts) if act.texts is not None else None
            votes = json.dumps(act.votes) if act.votes is not None else None

            data_tuple = (
                act.title,
                act.act_number,
                act.simple_title,
                act.content,
                refs,
                texts,
                act.item_type,
                act.announcement_date,
                act.change_date,
                act.promulgation,
                act.item_status,
                act.comments,
                act.keywords,
                act.file,
                votes,
                act.category,
            )

            with self.get_connection() as (conn, cursor):
                cursor.execute(insert_query, data_tuple)
                conn.commit()

            logger.info(f"Successfully saved act: {act.title}")
            return True

        except Exception as e:
            logger.error(f"Error saving act to database: {e}")
            raise DatabaseError(f"Failed to save act: {e}")

    def get_act_by_number(self, act_number: str) -> Optional[Act]:
        """
        Get an act by its number.

        Args:
            act_number: Act number to search for

        Returns:
            Act entity or None if not found
        """
        query = "SELECT * FROM acts WHERE act_number = %s LIMIT 1"

        try:
            with self.get_connection() as (conn, cursor):
                cursor.execute(query, (act_number,))
                result = cursor.fetchone()

                if not result:
                    return None

                # Convert database row to Act entity
                # result is a tuple with columns in this order:
                # 0:id, 1:title, 2:act_number, 3:simple_title, 4:content, 5:refs, 6:texts, 7:item_type,
                # 8:announcement_date, 9:change_date, 10:promulgation, 11:item_status, 12:comments,
                # 13:keywords, 14:file, 15:votes, 16:category
                return Act(
                    title=result[1],
                    act_number=result[2],
                    simple_title=result[3],
                    content=result[4],
                    refs=result[5],
                    texts=result[6],
                    item_type=result[7],
                    announcement_date=result[8],
                    change_date=result[9],
                    promulgation=result[10],
                    item_status=result[11],
                    comments=result[12],
                    keywords=result[13] or [],
                    file=result[14],
                    votes=result[15],
                    category=result[16],
                )

        except Exception as e:
            logger.error(f"Error fetching act: {e}")
            raise DatabaseError(f"Failed to fetch act: {e}")
