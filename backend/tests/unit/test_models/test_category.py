"""Tests for category data model - only business logic."""

from app.models.category import Category


class TestCategory:
    """Test Category dataclass business logic - only the to_dict method."""

    def test_category_to_dict_returns_correct_format(self):
        """Test that to_dict() returns correct dictionary format."""
        # Arrange
        category = Category(
            category="Zdrowie",
            keywords=["medycyna", "szpitale", "pacjenci"]
        )

        # Act
        result = category.to_dict()

        # Assert
        expected = {
            "category": "Zdrowie",
            "keywords": ["medycyna", "szpitale", "pacjenci"]
        }
        assert result == expected

    def test_category_to_dict_with_empty_keywords(self):
        """Test that to_dict() handles empty keywords list."""
        # Arrange
        category = Category(category="Edukacja", keywords=[])

        # Act
        result = category.to_dict()

        # Assert
        expected = {"category": "Edukacja", "keywords": []}
        assert result == expected

