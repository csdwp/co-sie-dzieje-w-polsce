import json
from typing import Any, Dict, Optional, cast

from ..core.config import LAST_KNOWN_FILE


def get_last_known() -> Optional[Dict[str, Any]]:
    try:
        if LAST_KNOWN_FILE.exists():
            with open(LAST_KNOWN_FILE, "r", encoding="utf-8") as f:
                return cast(Dict[str, Any], json.load(f))
        return None
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error while reading file {LAST_KNOWN_FILE}: {e}")
        return None


def save_last_known(act: Dict[str, Any]) -> bool:
    try:
        with open(LAST_KNOWN_FILE, "w", encoding="utf-8") as f:
            json.dump(act, f, ensure_ascii=False)
        return True
    except IOError as e:
        print(f"Error while saving to file {LAST_KNOWN_FILE}: {e}")
        return False
