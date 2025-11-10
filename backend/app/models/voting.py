"""Data models for voting information."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class VoteCount:
    """Vote counts for a specific type."""

    yes: int = 0
    no: int = 0
    abstain: int = 0
    absent: int = 0


@dataclass
class VotePercentages:
    """Vote percentages for each type."""

    yes: float = 0.0
    no: float = 0.0
    abstain: float = 0.0
    absent: float = 0.0


@dataclass
class PartyVotes:
    """Voting information for a single party."""

    total_members: int
    votes: VoteCount
    percentages: VotePercentages

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "totalMembers": self.total_members,
            "votes": {
                "yes": self.votes.yes,
                "no": self.votes.no,
                "abstain": self.votes.abstain,
                "absent": self.votes.absent,
            },
            "percentages": {
                "yes": self.percentages.yes,
                "no": self.percentages.no,
                "abstain": self.percentages.abstain,
                "absent": self.percentages.absent,
            },
        }


@dataclass
class VoteSummary:
    """Overall voting summary."""

    total: int
    yes: int
    no: int
    abstain: int
    absent: int
    percentages: VotePercentages

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "total": self.total,
            "yes": self.yes,
            "no": self.no,
            "abstain": self.abstain,
            "absent": self.absent,
            "percentages": {
                "yes": self.percentages.yes,
                "no": self.percentages.no,
                "abstain": self.percentages.abstain,
                "absent": self.percentages.absent,
            },
        }


@dataclass
class GovernmentVotes:
    """Government coalition voting information."""

    parties: List[str]
    votes_percentage: VotePercentages

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "parties": self.parties,
            "votesPercentage": {
                "yes": self.votes_percentage.yes,
                "no": self.votes_percentage.no,
                "abstain": self.votes_percentage.abstain,
                "absent": self.votes_percentage.absent,
            },
        }


@dataclass
class VotesSupportByGroup:
    """Vote support breakdown by group (government vs opposition)."""

    yes_votes: int
    yes_percentage: float

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {"yesVotes": self.yes_votes, "yesPercentage": self.yes_percentage}


@dataclass
class VotingData:
    """Complete voting data structure."""

    parties: Dict[str, PartyVotes] = field(default_factory=dict)
    summary: Optional[VoteSummary] = None
    government: Optional[GovernmentVotes] = None
    votes_support_by_group: Dict[str, VotesSupportByGroup] = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        result = {
            "parties": {party: votes.to_dict() for party, votes in self.parties.items()}
        }

        if self.summary:
            result["summary"] = self.summary.to_dict()

        if self.government:
            result["government"] = self.government.to_dict()

        if self.votes_support_by_group:
            result["votesSupportByGroup"] = {
                group: support.to_dict()
                for group, support in self.votes_support_by_group.items()
            }

        return result
