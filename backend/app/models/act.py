"""Data models for legal acts."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class ActAnalysis:
    """Result of AI analysis of an act."""

    title: str
    content_html: str


@dataclass
class ActData:
    """Raw act data from API before processing."""

    eli: str
    title: str
    type: str
    promulgation: str
    announcement_date: Optional[str] = None
    change_date: Optional[str] = None
    status: Optional[str] = None
    comments: Optional[str] = None
    keywords: List[str] = field(default_factory=list)
    references: Optional[Dict[str, Any]] = None
    texts: Optional[List[Dict[str, str]]] = None
    prints: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class CategoryData:
    """Category data with keywords."""

    category: str
    keywords: List[str]


@dataclass
class Act:
    """Complete act entity ready for database storage."""

    title: str
    act_number: Optional[str]
    simple_title: Optional[str]
    content: Optional[str]
    refs: Optional[Dict[str, Any]]
    texts: Optional[List[Dict[str, str]]]
    item_type: str
    announcement_date: Optional[datetime]
    change_date: Optional[datetime]
    promulgation: Optional[datetime]
    item_status: Optional[str]
    comments: Optional[str]
    keywords: List[str]
    file: str
    votes: Optional[Dict[str, Any]]
    category: Optional[str]

    def to_db_tuple(self) -> tuple:
        """Convert to tuple for database insertion."""
        return (
            self.title,
            self.act_number,
            self.simple_title,
            self.content,
            self.refs,
            self.texts,
            self.item_type,
            self.announcement_date,
            self.change_date,
            self.promulgation,
            self.item_status,
            self.comments,
            self.keywords,
            self.file,
            self.votes,
            self.category,
        )
