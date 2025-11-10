"""Tests for act data models - only business logic."""

from datetime import datetime

from app.models.act import Act


class TestAct:
    """Test Act dataclass business logic - only the to_db_tuple method."""

    def test_act_to_tuple_conversion_returns_correct_format(self):
        """Test that to_db_tuple() returns correct tuple format."""
        # Arrange
        promulgation_date = datetime(2024, 1, 15)
        keywords = ["prawo", "test"]
        votes = {"for": 100, "against": 50}

        act = Act(
            title="Ustawa o testach",
            act_number="123",
            simple_title="O testach",
            content="<p>Treść ustawy</p>",
            refs={"ref": "value"},
            texts=[{"type": "pdf"}],
            item_type="Ustawa",
            announcement_date=datetime(2024, 1, 10),
            change_date=datetime(2024, 1, 20),
            promulgation=promulgation_date,
            item_status="obowiązujący",
            comments="Komentarz",
            keywords=keywords,
            file="https://example.com/act.pdf",
            votes=votes,
            category="Prawo"
        )

        # Act
        result = act.to_db_tuple()

        # Assert
        expected = (
            "Ustawa o testach",  # title
            "123",               # act_number
            "O testach",         # simple_title
            "<p>Treść ustawy</p>", # content
            {"ref": "value"},    # refs
            [{"type": "pdf"}],   # texts
            "Ustawa",            # item_type
            datetime(2024, 1, 10), # announcement_date
            datetime(2024, 1, 20), # change_date
            promulgation_date,   # promulgation
            "obowiązujący",      # item_status
            "Komentarz",         # comments
            keywords,            # keywords
            "https://example.com/act.pdf", # file
            votes,                # votes
            "Prawo"              # category
        )

        assert result == expected
        assert len(result) == 16

    def test_act_to_tuple_with_none_values_returns_correct_tuple(self):
        """Test that to_db_tuple() handles None values correctly."""
        # Arrange
        act = Act(
            title="Ustawa minimalna",
            item_type="Ustawa",
            keywords=[],
            file="https://example.com/act.pdf",
            act_number=None,
            simple_title=None,
            content=None,
            refs=None,
            texts=None,
            announcement_date=None,
            change_date=None,
            promulgation=None,
            item_status=None,
            comments=None,
            votes=None,
            category=None
        )

        # Act
        result = act.to_db_tuple()

        # Assert
        expected = (
            "Ustawa minimalna",  # title
            None,                # act_number
            None,                # simple_title
            None,                # content
            None,                # refs
            None,                # texts
            "Ustawa",            # item_type
            None,                # announcement_date
            None,                # change_date
            None,                # promulgation
            None,                # item_status
            None,                # comments
            [],                  # keywords
            "https://example.com/act.pdf", # file
            None,                # votes
            None                 # category
        )

        assert result == expected
        assert len(result) == 16
