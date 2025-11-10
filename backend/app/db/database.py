import json
import logging
import os
from contextlib import contextmanager
from typing import Any, Dict, Generator, List, Optional, Tuple

import psycopg2
from dotenv import load_dotenv

from ..models.act import CategoryData

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()


@contextmanager
def get_db_connection() -> Generator[Tuple[Any, Any], None, None]:
    connection_string = os.getenv("DATABASE_URL")
    if not connection_string:
        raise ValueError("DATABASE_URL is not set in environment variables")

    conn = None
    cursor = None
    try:
        conn = psycopg2.connect(connection_string)
        cursor = conn.cursor()
        yield conn, cursor
    except Exception as e:
        if conn:
            conn.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def find_category_by_keywords(keywords: List[str]) -> Optional[str]:
    if not keywords:
        return None

    try:
        with get_db_connection() as (conn, cursor):
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
        logger.error(f"JSON approach failed: {e}")

    try:
        with get_db_connection() as (conn, cursor):
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
        logger.error(f"JSONB approach failed: {e}")

    try:
        with get_db_connection() as (conn, cursor):
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
        logger.error(f"Text search approach failed: {e}")
        return None


def get_all_categories_with_keywords() -> Optional[List[CategoryData]]:
    try:
        with get_db_connection() as (conn, cursor):
            cursor.execute("SELECT category, keywords FROM category ORDER BY category")
            results = cursor.fetchall()

            categories_data = []
            for row in results:
                category_name, keywords_raw = row

                # Parse keywords from JSON string to list
                if isinstance(keywords_raw, str):
                    try:
                        keywords = json.loads(keywords_raw)
                    except json.JSONDecodeError:
                        keywords = [keywords_raw]
                elif isinstance(keywords_raw, list):
                    keywords = keywords_raw
                else:
                    keywords = []

                categories_data.append(
                    CategoryData(category=category_name, keywords=keywords)
                )

            return categories_data

    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        return None


def save_to_database(filtered_item: Dict[str, Any]) -> bool:
    keywords = filtered_item.get("keywords", [])
    category_name = None

    if isinstance(keywords, list) and keywords:
        category_name = smart_find_category_by_keywords(
            keywords, filtered_item.get("title", ""), filtered_item.get("content", "")
        )

    if not category_name:
        all_categories = get_all_categories_with_keywords()
        if all_categories:
            logger.info("Available categories with keywords:")
            logger.info(json.dumps(all_categories, indent=2, ensure_ascii=False))
        else:
            logger.info("No categories found or error occurred")

    insert_query = """
    INSERT INTO acts (
        title, act_number, simple_title, content, refs, texts, item_type,
        announcement_date, change_date, promulgation, item_status, comments,
        keywords, file, votes, category
    ) VALUES %s
    """

    references = (
        json.dumps(filtered_item.get("references"))
        if filtered_item.get("references") is not None
        else None
    )
    texts = (
        json.dumps(filtered_item.get("texts"))
        if filtered_item.get("texts") is not None
        else None
    )
    votes = (
        json.dumps(filtered_item.get("votes"))
        if filtered_item.get("votes") is not None
        else None
    )

    data_tuple = (
        filtered_item.get("title"),
        filtered_item.get("actNumber"),
        filtered_item.get("simpleTitle"),
        filtered_item.get("content"),
        references,
        texts,
        filtered_item.get("type"),
        filtered_item.get("announcementDate"),
        filtered_item.get("changeDate"),
        filtered_item.get("promulgation"),
        filtered_item.get("status"),
        filtered_item.get("comments"),
        filtered_item.get("keywords"),
        filtered_item.get("file"),
        votes,
        category_name,
    )

    try:
        with get_db_connection() as (conn, cursor):
            cursor.execute(insert_query, data_tuple)
            conn.commit()
        logger.info("Data saved successfully.")
        return True
    except Exception as e:
        logger.error(f"Error during data save: {e}")
        return False


def extend_category_keywords(
    category_name: str, new_keywords: List[str], all_categories: List[CategoryData]
) -> Optional[str]:
    try:
        current_keywords = []
        for category_data in all_categories:
            if category_data.category == category_name:
                # CategoryData.keywords jest już listą stringów
                current_keywords = category_data.keywords
                break

        all_keywords = list(set(current_keywords + new_keywords))

        with get_db_connection() as (conn, cursor):
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
        return None


def create_new_category(category_name: str, keywords: List[str]) -> Optional[str]:
    try:
        unique_keywords = list(set(keywords))

        with get_db_connection() as (conn, cursor):
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
        logger.error(f"Error creating new category: {e}")
        return None


def smart_find_category_by_keywords(
    keywords: List[str], title: str = "", content: str = ""
) -> Optional[str]:
    from ..services.analyze_service import find_or_create_category_with_ai

    if not keywords:
        return None

    existing_category = find_category_by_keywords(keywords)
    if existing_category:
        return existing_category

    all_categories = get_all_categories_with_keywords()
    if not all_categories:
        logger.warning("No categories found in database")
        return None

    logger.info("No exact category match found, using AI for smart categorization")
    return find_or_create_category_with_ai(keywords, all_categories, title, content)
