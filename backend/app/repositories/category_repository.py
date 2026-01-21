"""Repository for category table operations."""

import json
from typing import List, Optional

from ..core.exceptions import DatabaseError
from ..core.logging import get_logger
from ..models.category import Category
from .base_repository import BaseRepository

logger = get_logger(__name__)


class CategoryRepository(BaseRepository):
    """Repository for category data access."""

    def find_by_keywords(self, keywords: List[str]) -> Optional[str]:
        """
        Find category by matching keywords.

        Args:
            keywords: List of keywords to search for

        Returns:
            Category name if found, None otherwise
        """
        if not keywords:
            return None

        # Try JSON approach first
        try:
            with self.get_connection() as (conn, cursor):
                cursor.execute(
                    """
                    SELECT category FROM category 
                    WHERE EXISTS (
                        SELECT 1 FROM json_array_elements_text(keywords) AS keyword
                        WHERE keyword = ANY(%s)
                    ) LIMIT 1
                """,
                    (keywords,),
                )
                result = cursor.fetchone()
                return result[0] if result else None
        except Exception as e:
            logger.debug(f"JSON approach failed: {e}")

        # Try JSONB approach
        try:
            with self.get_connection() as (conn, cursor):
                cursor.execute(
                    """
                    SELECT category FROM category 
                    WHERE EXISTS (
                        SELECT 1 FROM jsonb_array_elements_text(keywords::jsonb) AS keyword
                        WHERE keyword = ANY(%s)
                    ) LIMIT 1
                """,
                    (keywords,),
                )
                result = cursor.fetchone()
                return result[0] if result else None
        except Exception as e:
            logger.debug(f"JSONB approach failed: {e}")

        # Fallback to text search
        try:
            with self.get_connection() as (conn, cursor):
                cursor.execute(
                    """
                    SELECT category FROM category 
                    WHERE keywords::text LIKE ANY(
                        SELECT '%"' || keyword || '"%' 
                        FROM unnest(%s) AS keyword
                    ) LIMIT 1
                """,
                    (keywords,),
                )
                result = cursor.fetchone()
                return result[0] if result else None
        except Exception as e:
            logger.error(f"All approaches failed: {e}")
            return None

    def get_all_categories(self) -> List[Category]:
        """
        Get all categories with their keywords.

        Returns:
            List of Category entities
        """
        try:
            with self.get_connection() as (conn, cursor):
                cursor.execute(
                    "SELECT category, keywords FROM category ORDER BY category"
                )
                results = cursor.fetchall()

                categories = []
                for row in results:
                    category_name, keywords = row

                    # Parse keywords
                    if isinstance(keywords, str):
                        try:
                            keywords_list = json.loads(keywords)
                        except json.JSONDecodeError:
                            keywords_list = [keywords]
                    elif isinstance(keywords, list):
                        keywords_list = keywords
                    else:
                        keywords_list = []

                    categories.append(
                        Category(category=category_name, keywords=keywords_list)
                    )

                return categories

        except Exception as e:
            logger.error(f"Error fetching categories: {e}")
            raise DatabaseError(f"Failed to fetch categories: {e}")

    def create_category(self, category_name: str, keywords: List[str]) -> Optional[str]:
        """
        Create a new category.

        Args:
            category_name: Name of the category
            keywords: List of keywords for the category

        Returns:
            Category name if successful, None otherwise
        """
        try:
            unique_keywords = list(set(keywords))

            with self.get_connection() as (conn, cursor):
                cursor.execute(
                    "INSERT INTO category (category, keywords) VALUES (%s, %s)",
                    (category_name, json.dumps(unique_keywords)),
                )
                conn.commit()

            logger.info(
                f"Created new category '{category_name}' with {len(unique_keywords)} keywords"
            )
            return category_name

        except Exception as e:
            logger.error(f"Error creating category: {e}")
            raise DatabaseError(f"Failed to create category: {e}")

    def extend_keywords(
        self, category_name: str, new_keywords: List[str]
    ) -> Optional[str]:
        """
        Extend existing category with new keywords.

        Args:
            category_name: Name of the category to extend
            new_keywords: New keywords to add

        Returns:
            Category name if successful, None otherwise
        """
        try:
            # Get current keywords
            all_categories = self.get_all_categories()
            current_keywords = []

            for category in all_categories:
                if category.category == category_name:
                    current_keywords = category.keywords
                    break

            # Merge and deduplicate
            all_keywords = list(set(current_keywords + new_keywords))

            with self.get_connection() as (conn, cursor):
                cursor.execute(
                    "UPDATE category SET keywords = %s WHERE category = %s",
                    (json.dumps(all_keywords), category_name),
                )
                conn.commit()

            logger.info(
                f"Extended category '{category_name}' with {len(new_keywords)} new keywords"
            )
            return category_name

        except Exception as e:
            logger.error(f"Error extending category: {e}")
            raise DatabaseError(f"Failed to extend category: {e}")
