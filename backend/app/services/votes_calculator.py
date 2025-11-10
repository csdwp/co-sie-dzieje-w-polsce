"""Voting statistics calculator."""

from collections import defaultdict
from typing import Any, Dict, List

from ..core.logging import get_logger

logger = get_logger(__name__)

# Government parties by parliamentary term
GOVERNMENT_PARTIES = {10: ["KO", "Lewica", "Polska2050-TD", "PSL-TD"]}


class VotesCalculator:
    """Service for calculating voting statistics."""

    def __init__(self):
        """Initialize votes calculator."""
        pass

    def process_voting_data(
        self, data: Dict[str, Any], term: int = 10
    ) -> Dict[str, Any]:
        """
        Process raw voting data into structured statistics.

        Args:
            data: Raw voting data from Sejm API
            term: Parliamentary term number

        Returns:
            Processed voting statistics
        """
        result = self._create_empty_result()

        government_parties = GOVERNMENT_PARTIES.get(term, [])
        result["government"]["parties"] = government_parties

        if "votes" not in data:
            logger.warning("No votes data in input")
            return result

        # Collect votes by party
        party_votes = self._collect_votes_by_party(data["votes"])

        # Calculate percentages for each party
        for party, votes in party_votes.items():
            self._calculate_party_percentages(result, party, votes)

        # Calculate summary statistics
        self._calculate_summary_percentages(result)
        self._calculate_government_percentages(result, party_votes, government_parties)
        self._calculate_votes_support_by_group(result, party_votes, government_parties)

        return result

    def _create_empty_result(self) -> Dict[str, Any]:
        """Create empty result structure."""
        return {
            "parties": {},
            "government": {
                "parties": [],
                "votesPercentage": {"yes": 0, "no": 0, "abstain": 0, "absent": 0},
            },
            "summary": {
                "total": 0,
                "yes": 0,
                "no": 0,
                "abstain": 0,
                "absent": 0,
                "percentages": {"yes": 0, "no": 0, "abstain": 0, "absent": 0},
            },
            "votesSupportByGroup": {
                "government": {"yesVotes": 0, "yesPercentage": 0},
                "opposition": {"yesVotes": 0, "yesPercentage": 0},
            },
        }

    def _collect_votes_by_party(
        self, votes: List[Dict[str, Any]]
    ) -> Dict[str, Dict[str, int]]:
        """
        Collect votes grouped by party.

        Args:
            votes: List of individual votes

        Returns:
            Dictionary of party votes
        """
        party_votes: Dict[str, Dict[str, int]] = defaultdict(
            lambda: {"yes": 0, "no": 0, "abstain": 0, "absent": 0, "total": 0}
        )

        for vote in votes:
            club = vote.get("club")
            vote_type = vote.get("vote")

            if not club:
                continue

            party_votes[club]["total"] += 1

            if vote_type == "YES":
                party_votes[club]["yes"] += 1
            elif vote_type == "NO":
                party_votes[club]["no"] += 1
            elif vote_type == "ABSTAIN":
                party_votes[club]["abstain"] += 1
            else:
                party_votes[club]["absent"] += 1

        return party_votes

    def _calculate_party_percentages(
        self, result: Dict[str, Any], party: str, votes: Dict[str, int]
    ) -> None:
        """Calculate percentages for a single party."""
        total = votes["total"]
        if total <= 0:
            return

        # Update summary totals
        result["summary"]["total"] += total
        result["summary"]["yes"] += votes["yes"]
        result["summary"]["no"] += votes["no"]
        result["summary"]["abstain"] += votes["abstain"]
        result["summary"]["absent"] += votes["absent"]

        # Calculate party percentages
        result["parties"][party] = {
            "totalMembers": total,
            "votes": {
                "yes": votes["yes"],
                "no": votes["no"],
                "abstain": votes["abstain"],
                "absent": votes["absent"],
            },
            "percentages": {
                "yes": round((votes["yes"] / total) * 100, 1),
                "no": round((votes["no"] / total) * 100, 1),
                "abstain": round((votes["abstain"] / total) * 100, 1),
                "absent": round((votes["absent"] / total) * 100, 1),
            },
        }

    def _calculate_summary_percentages(self, result: Dict[str, Any]) -> None:
        """Calculate overall summary percentages."""
        total = result["summary"]["total"]
        if total <= 0:
            return

        result["summary"]["percentages"] = {
            "yes": round((result["summary"]["yes"] / total) * 100, 1),
            "no": round((result["summary"]["no"] / total) * 100, 1),
            "abstain": round((result["summary"]["abstain"] / total) * 100, 1),
            "absent": round((result["summary"]["absent"] / total) * 100, 1),
        }

    def _calculate_government_percentages(
        self,
        result: Dict[str, Any],
        party_votes: Dict[str, Dict[str, int]],
        government_parties: List[str],
    ) -> None:
        """Calculate government coalition percentages."""
        gov_votes = {"yes": 0, "no": 0, "abstain": 0, "absent": 0, "total": 0}

        for party in government_parties:
            if party in party_votes:
                gov_votes["yes"] += party_votes[party]["yes"]
                gov_votes["no"] += party_votes[party]["no"]
                gov_votes["abstain"] += party_votes[party]["abstain"]
                gov_votes["absent"] += party_votes[party]["absent"]
                gov_votes["total"] += party_votes[party]["total"]

        if gov_votes["total"] > 0:
            result["government"]["votesPercentage"] = {
                "yes": round((gov_votes["yes"] / gov_votes["total"]) * 100, 1),
                "no": round((gov_votes["no"] / gov_votes["total"]) * 100, 1),
                "abstain": round((gov_votes["abstain"] / gov_votes["total"]) * 100, 1),
                "absent": round((gov_votes["absent"] / gov_votes["total"]) * 100, 1),
            }

    def _calculate_votes_support_by_group(
        self,
        result: Dict[str, Any],
        party_votes: Dict[str, Dict[str, int]],
        government_parties: List[str],
    ) -> None:
        """Calculate vote support by government vs opposition."""
        total_yes = result["summary"]["yes"]
        if total_yes == 0:
            return

        gov_yes = 0
        opp_yes = 0

        for party, votes in party_votes.items():
            if party in government_parties:
                gov_yes += votes["yes"]
            else:
                opp_yes += votes["yes"]

        result["votesSupportByGroup"] = {
            "government": {
                "yesVotes": gov_yes,
                "yesPercentage": round((gov_yes / total_yes) * 100, 1),
            },
            "opposition": {
                "yesVotes": opp_yes,
                "yesPercentage": round((opp_yes / total_yes) * 100, 1),
            },
        }
