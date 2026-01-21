"""Tests for voting data models - only business logic."""

import pytest

from app.models.voting import (
    VoteCount,
    VotePercentages,
    PartyVotes,
    VoteSummary,
    GovernmentVotes,
    VotesSupportByGroup,
    VotingData,
)


@pytest.fixture
def sample_vote_count():
    """Sample vote count for testing."""
    return VoteCount(yes=10, no=5, abstain=2, absent=1)


@pytest.fixture
def sample_percentages():
    """Sample percentages for testing."""
    return VotePercentages(yes=66.7, no=33.3, abstain=13.3, absent=6.7)


@pytest.fixture
def sample_party_votes(sample_vote_count, sample_percentages):
    """Sample party votes for testing."""
    return PartyVotes(
        total_members=18,
        votes=sample_vote_count,
        percentages=sample_percentages
    )


@pytest.fixture
def sample_party_votes_alt():
    """Alternative sample party votes for testing multiple parties."""
    vote_count = VoteCount(yes=15, no=8, abstain=3, absent=1)
    percentages = VotePercentages(yes=65.0, no=35.0, abstain=13.0, absent=4.0)
    return PartyVotes(total_members=27, votes=vote_count, percentages=percentages)


@pytest.fixture
def sample_vote_summary():
    """Sample vote summary for testing."""
    percentages = VotePercentages(yes=66.0, no=34.0, abstain=15.0, absent=5.0)
    return VoteSummary(
        total=64, yes=35, no=18, abstain=8, absent=3, percentages=percentages
    )


@pytest.fixture
def sample_government_votes():
    """Sample government votes for testing."""
    percentages = VotePercentages(yes=70.0, no=25.0, abstain=4.0, absent=1.0)
    return GovernmentVotes(
        parties=["Party A", "Party B"], votes_percentage=percentages
    )


@pytest.fixture
def sample_support_gov():
    """Sample government support for testing."""
    return VotesSupportByGroup(yes_votes=25, yes_percentage=71.4)


@pytest.fixture
def sample_support_opp():
    """Sample opposition support for testing."""
    return VotesSupportByGroup(yes_votes=10, yes_percentage=55.6)


class TestPartyVotes:
    """Test PartyVotes dataclass business logic - only the to_dict method."""

    def test_party_votes_to_dict_returns_correct_format(self, sample_party_votes):
        """Test that PartyVotes.to_dict() returns correct dictionary format."""
        # Act
        result = sample_party_votes.to_dict()

        # Assert
        expected = {
            "totalMembers": 18,
            "votes": {"yes": 10, "no": 5, "abstain": 2, "absent": 1},
            "percentages": {"yes": 66.7, "no": 33.3, "abstain": 13.3, "absent": 6.7}
        }
        assert result == expected


class TestVoteSummary:
    """Test VoteSummary dataclass business logic - only the to_dict method."""

    def test_vote_summary_to_dict_returns_correct_format(self):
        """Test that VoteSummary.to_dict() returns correct dictionary format."""
        # Arrange
        percentages = VotePercentages(yes=60.0, no=30.0, abstain=7.5, absent=2.5)
        summary = VoteSummary(
            total=200,
            yes=120,
            no=60,
            abstain=15,
            absent=5,
            percentages=percentages
        )

        # Act
        result = summary.to_dict()

        # Assert
        expected = {
            "total": 200,
            "yes": 120,
            "no": 60,
            "abstain": 15,
            "absent": 5,
            "percentages": {"yes": 60.0, "no": 30.0, "abstain": 7.5, "absent": 2.5}
        }
        assert result == expected


class TestGovernmentVotes:
    """Test GovernmentVotes dataclass business logic - only the to_dict method."""

    def test_government_votes_to_dict_returns_correct_format(self):
        """Test that GovernmentVotes.to_dict() returns correct dictionary format."""
        # Arrange
        percentages = VotePercentages(yes=75.0, no=20.0, abstain=3.0, absent=2.0)
        government = GovernmentVotes(
            parties=["PiS", "Solidarna Polska", "Porozumienie"],
            votes_percentage=percentages
        )

        # Act
        result = government.to_dict()

        # Assert
        expected = {
            "parties": ["PiS", "Solidarna Polska", "Porozumienie"],
            "votesPercentage": {"yes": 75.0, "no": 20.0, "abstain": 3.0, "absent": 2.0}
        }
        assert result == expected


class TestVotesSupportByGroup:
    """Test VotesSupportByGroup dataclass business logic - only the to_dict method."""

    def test_votes_support_by_group_to_dict_returns_correct_format(self):
        """Test that VotesSupportByGroup.to_dict() returns correct dictionary format."""
        # Arrange
        support = VotesSupportByGroup(yes_votes=150, yes_percentage=65.2)

        # Act
        result = support.to_dict()

        # Assert
        expected = {"yesVotes": 150, "yesPercentage": 65.2}
        assert result == expected


class TestVotingData:
    """Test VotingData dataclass business logic - only the to_dict method."""

    def test_voting_data_to_dict_with_all_data_returns_complete_dict(
        self, sample_party_votes, sample_party_votes_alt, sample_vote_summary,
        sample_government_votes, sample_support_gov, sample_support_opp
    ):
        """Test that VotingData.to_dict() returns complete dictionary with all data."""
        # Arrange
        voting_data = VotingData(
            parties={"Party A": sample_party_votes, "Party B": sample_party_votes_alt},
            summary=sample_vote_summary,
            government=sample_government_votes,
            votes_support_by_group={"government": sample_support_gov, "opposition": sample_support_opp}
        )

        # Act
        result = voting_data.to_dict()

        # Assert - check structure
        assert "parties" in result
        assert "summary" in result
        assert "government" in result
        assert "votesSupportByGroup" in result

        # Check parties
        assert len(result["parties"]) == 2
        assert "Party A" in result["parties"]
        assert "Party B" in result["parties"]

        # Check summary
        assert result["summary"]["total"] == 64
        assert result["summary"]["yes"] == 35

        # Check government
        assert result["government"]["parties"] == ["Party A", "Party B"]

        # Check support by group
        assert len(result["votesSupportByGroup"]) == 2
        assert result["votesSupportByGroup"]["government"]["yesVotes"] == 25

    def test_voting_data_to_dict_with_minimal_data_returns_basic_dict(self):
        """Test that VotingData.to_dict() returns minimal dictionary with only parties."""
        # Arrange
        voting_data = VotingData()  # Empty initialization

        # Act
        result = voting_data.to_dict()

        # Assert
        expected = {"parties": {}}
        assert result == expected

    def test_voting_data_to_dict_without_optional_fields_excludes_them(self):
        """Test that VotingData.to_dict() excludes optional fields when None."""
        # Arrange
        vote_count = VoteCount(yes=10, no=5, abstain=2, absent=1)
        percentages = VotePercentages(yes=50.0, no=25.0, abstain=15.0, absent=10.0)
        party = PartyVotes(total_members=20, votes=vote_count, percentages=percentages)

        voting_data = VotingData(
            parties={"TestParty": party},
            summary=None,  # No summary
            government=None,  # No government
            votes_support_by_group={}  # Empty support
        )

        # Act
        result = voting_data.to_dict()

        # Assert - should not include optional fields
        assert "parties" in result
        assert "summary" not in result
        assert "government" not in result
        assert "votesSupportByGroup" not in result  # Empty dict should not be included
