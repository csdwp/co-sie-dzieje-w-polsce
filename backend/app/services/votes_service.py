from collections import defaultdict
from typing import Any, Dict, List

import requests

GOVERNMENT_PARTIES = {10: ["KO", "Lewica", "Polska2050-TD", "PSL-TD"]}


def get_sejm_voting_data(
    term: int = 10, sitting: int = 32, voting: int = 29
) -> Dict[str, Any]:
    url = f"https://api.sejm.gov.pl/sejm/term{term}/votings/{sitting}/{voting}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Data download error: {e}")
        return create_empty_result()

    return process_voting_data(data, term)


def create_empty_result() -> Dict[str, Any]:
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


def process_voting_data(data: Dict[str, Any], term: int) -> Dict[str, Any]:
    result = create_empty_result()

    government_parties = GOVERNMENT_PARTIES.get(term, [])
    result["government"]["parties"] = government_parties

    if "votes" not in data:
        return result

    party_votes = collect_votes_by_party(data["votes"])

    for party, votes in party_votes.items():
        calculate_party_percentages(result, party, votes)

    calculate_summary_percentages(result)
    calculate_government_percentages(result, party_votes, government_parties)
    calculate_votes_support_by_group(result, party_votes, government_parties)

    return result


def collect_votes_by_party(votes: List[Dict[str, Any]]) -> Dict[str, Dict[str, int]]:
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


def calculate_party_percentages(
    result: Dict[str, Any], party: str, votes: Dict[str, int]
) -> None:
    total = votes["total"]
    if total <= 0:
        return

    result["summary"]["total"] += total
    result["summary"]["yes"] += votes["yes"]
    result["summary"]["no"] += votes["no"]
    result["summary"]["abstain"] += votes["abstain"]
    result["summary"]["absent"] += votes["absent"]

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


def calculate_summary_percentages(result: Dict[str, Any]) -> None:
    total = result["summary"]["total"]
    if total <= 0:
        return

    result["summary"]["percentages"] = {
        "yes": round((result["summary"]["yes"] / total) * 100, 1),
        "no": round((result["summary"]["no"] / total) * 100, 1),
        "abstain": round((result["summary"]["abstain"] / total) * 100, 1),
        "absent": round((result["summary"]["absent"] / total) * 100, 1),
    }


def calculate_government_percentages(
    result: Dict[str, Any],
    party_votes: Dict[str, Dict[str, int]],
    government_parties: List[str],
) -> None:
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


def calculate_votes_support_by_group(
    result: Dict[str, Any],
    party_votes: Dict[str, Dict[str, int]],
    government_parties: List[str],
) -> None:
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
