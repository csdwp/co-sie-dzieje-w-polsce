"""Data models for summary validation."""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ClaimVerification:
    """Result of verifying a single factual claim against source text."""

    claim: str
    supported: bool
    evidence_chunk: Optional[int]


@dataclass
class ValidationReport:
    """Full validation report from atomic claim verification."""

    claims: List[ClaimVerification]
    overall_confidence: float
    hallucinations: List[str]
    verdict: str
    recommendation: str
