"""Data models for categories."""

from dataclasses import dataclass, field
from typing import List


@dataclass
class Category:
    """Category entity."""

    category: str
    keywords: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {"category": self.category, "keywords": self.keywords}
