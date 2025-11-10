"""E2E test configuration and fixtures."""

import pytest
from pathlib import Path

# Load test environment variables
test_env_path = Path(__file__).parent.parent.parent / "test.env"
if test_env_path.exists():
    from dotenv import load_dotenv

    load_dotenv(test_env_path)


@pytest.fixture(scope="session", autouse=True)
def load_test_env():
    """Load test environment variables."""
    # Environment variables are already loaded via dotenv in config.py
    # This fixture ensures test.env is loaded before any test runs
    pass


@pytest.fixture(scope="session")
def e2e_db_connection():
    """Provide database connection for e2e tests."""
    # The database connection is handled by ActRepository
    # This fixture just ensures the test DB is available
    from app.core.config import DATABASE_URL

    assert DATABASE_URL is not None, "DATABASE_URL must be set for e2e tests"
    # You might want to add database health check here
    return DATABASE_URL
