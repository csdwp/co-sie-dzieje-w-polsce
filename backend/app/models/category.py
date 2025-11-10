"""Data models for categories."""

from dataclasses import asdict, dataclass, field
from typing import List

@dataclass
class Category:
    category: str
    keywords: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return asdict(self)