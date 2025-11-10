"""AI-powered categorization service."""

import json
from typing import List, Optional

from ...core.logging import get_logger
from ...models.category import Category
from ...repositories.category_repository import CategoryRepository
from ..external.openai_client import OpenAIClient

logger = get_logger(__name__)


class Categorizer:
    """Service for AI-powered act categorization."""

    def __init__(
        self,
        openai_client: Optional[OpenAIClient] = None,
        category_repo: Optional[CategoryRepository] = None,
    ):
        """
        Initialize categorizer.

        Args:
            openai_client: OpenAI client instance
            category_repo: Category repository instance
        """
        self.openai_client = openai_client or OpenAIClient()
        self.category_repo = category_repo or CategoryRepository()

    def find_or_create_category(
        self, act_keywords: List[str], act_title: str = "", act_content: str = ""
    ) -> Optional[str]:
        """
        Find existing category or create new one using AI.

        Args:
            act_keywords: Keywords from the act
            act_title: Title of the act
            act_content: Content preview of the act

        Returns:
            Category name or None
        """
        if not act_keywords:
            logger.warning("No keywords provided for categorization")
            return None

        # Get all existing categories
        all_categories = self.category_repo.get_all_categories()

        if not all_categories:
            logger.warning("No categories found in database")
            return None

        # Prepare data for AI
        categories_info = [cat.to_dict() for cat in all_categories]

        act_info = {
            "keywords": act_keywords,
            "title": act_title[:200] if act_title else "",
            "content_preview": act_content[:500] if act_content else "",
        }

        # Create AI prompt
        prompt = f"""
        Analizujesz akt prawny i musisz zdecydować o kategorii. Masz do wyboru:
        
        1. DOPASUJ do istniejącej kategorii - jeśli słowa kluczowe aktu pasują do jednej z istniejących kategorii
        2. ROZSZERZ istniejącą kategorię - jeśli akt pasuje do kategorii, ale ma nowe słowa kluczowe
        3. UTWÓRZ nową kategorię - jeśli akt nie pasuje do żadnej istniejącej kategorii
        
        ISTNIEJĄCE KATEGORIE:
        {json.dumps(categories_info, ensure_ascii=False, indent=2)}
        
        AKT DO KATEGORYZACJI:
        {json.dumps(act_info, ensure_ascii=False, indent=2)}
        
        Zwróć JSON w formacie:
        {{
            "action": "match|extend|create",
            "category_name": "nazwa_kategorii",
            "new_keywords": ["lista", "nowych", "słów", "kluczowych"],
            "reasoning": "krótkie uzasadnienie decyzji"
        }}
        
        ZASADY:
        - Dla "match": zwróć istniejącą nazwę kategorii, new_keywords może być puste
        - Dla "extend": zwróć istniejącą nazwę kategorii + nowe keywords do dodania
        - Dla "create": wymyśl nową nazwę kategorii + wszystkie keywords
        - Nazwy kategorii po polsku, krótkie, opisowe
        - Keywords to kluczowe terminy prawne, nie całe frazy
        """

        try:
            ai_decision = self.openai_client.analyze_with_prompt(
                text="", prompt=prompt, max_tokens=500, expect_json=True
            )

            if not isinstance(ai_decision, dict) or "action" not in ai_decision:
                logger.error(f"Invalid AI response format: {ai_decision}")
                return None

            action = ai_decision.get("action")
            category_name = ai_decision.get("category_name")
            new_keywords = ai_decision.get("new_keywords", [])
            reasoning = ai_decision.get("reasoning", "No reasoning provided")

            logger.info(f"AI categorization decision: {action} - {reasoning}")

            # Execute action based on AI decision
            if action == "match":
                if category_name:
                    return self._handle_match(category_name, all_categories)
                else:
                    logger.error("Missing category_name for match action")
                    return None

            elif action == "extend":
                if category_name and new_keywords:
                    return self._handle_extend(category_name, new_keywords)
                else:
                    logger.error(
                        "Missing category_name or new_keywords for extend action"
                    )
                    return None

            elif action == "create":
                if category_name and new_keywords:
                    return self._handle_create(
                        category_name, new_keywords, act_keywords
                    )
                else:
                    logger.error(
                        "Missing category_name or new_keywords for create action"
                    )
                    return None

            else:
                logger.error(f"Unknown action: {action}")
                return None

        except Exception as e:
            logger.error(f"Error in AI categorization: {e}")
            return None

    def _handle_match(
        self, category_name: str, all_categories: List[Category]
    ) -> Optional[str]:
        """Handle match action - use existing category."""
        if any(cat.category == category_name for cat in all_categories):
            logger.info(f"Matched to existing category: {category_name}")
            return category_name
        else:
            logger.warning(f"AI suggested non-existent category: {category_name}")
            return None

    def _handle_extend(
        self, category_name: str, new_keywords: List[str]
    ) -> Optional[str]:
        """Handle extend action - add keywords to existing category."""
        try:
            result = self.category_repo.extend_keywords(category_name, new_keywords)
            logger.info(f"Extended category: {category_name}")
            return result
        except Exception as e:
            logger.error(f"Failed to extend category: {e}")
            return None

    def _handle_create(
        self, category_name: str, new_keywords: List[str], act_keywords: List[str]
    ) -> Optional[str]:
        """Handle create action - create new category."""
        try:
            all_keywords = new_keywords + act_keywords
            result = self.category_repo.create_category(category_name, all_keywords)
            logger.info(f"Created new category: {category_name}")
            return result
        except Exception as e:
            logger.error(f"Failed to create category: {e}")
            return None
