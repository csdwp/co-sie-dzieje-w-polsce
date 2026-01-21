import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASIC_URL = os.getenv("BASIC_URL")
API_URL = os.getenv("DU_URL")
VOTING_URL = os.getenv("VOTING_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

CURRENT_YEAR = datetime.now().year

LAST_KNOWN_FILE = Path(__file__).parent.parent / "data" / "last_known.json"
ACT_CONTENT_FILE = Path(__file__).parent.parent / "data" / "act_content.txt"
ELI_FOR_LATER = Path(__file__).parent.parent / "data" / "eli_for_later.json"
ACT_ANALYSIS_FILE = Path(__file__).parent.parent / "data" / "act_analysis.json"

MAX_ACTS_TO_PROCESS = 10
PDF_DOWNLOAD_TIMEOUT = 30

REQUIRED_ENV_VARS = ["BASIC_URL", "DU_URL", "DATABASE_URL", "OPENAI_API_KEY"]


def check_environment() -> bool:
    missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
    if missing_vars:
        print(f"ERROR: Missing environment variables: {', '.join(missing_vars)}")
        return False
    return True
