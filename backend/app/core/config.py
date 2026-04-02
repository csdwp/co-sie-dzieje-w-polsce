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

TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_KEY_SECRET = os.getenv("TWITTER_API_KEY_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_TOKEN_SECRET = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
TWITTER_POST_DELAY_MINUTES = int(os.getenv("TWITTER_POST_DELAY_MINUTES", "0"))

VERCEL_DEPLOY_HOOK_URL = os.getenv("VERCEL_DEPLOY_HOOK_URL")

CURRENT_YEAR = datetime.now().year

ACT_CONTENT_FILE = Path(__file__).parent.parent / "data" / "act_content.txt"
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
