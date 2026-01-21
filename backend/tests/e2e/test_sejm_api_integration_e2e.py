"""E2E test for Sejm API integration with database storage."""

import pytest
from app.services.external.sejm_api import SejmAPIClient
from app.services.act_processor import ActProcessor
from app.repositories.act_repository import ActRepository


@pytest.mark.e2e
def test_sejm_api_integration_e2e(e2e_db_connection):
    """Test full integration: fetch from Sejm API, process, and save to DB."""
    # Initialize services
    sejm_client = SejmAPIClient()
    processor = ActProcessor(sejm_api=sejm_client)
    repo = ActRepository()

    # Fetch acts for 2024 from real API
    acts_data = sejm_client.fetch_acts_for_year(2024)

    assert acts_data is not None, "Failed to fetch acts from Sejm API"
    assert len(acts_data) > 0, "No acts returned from API"

    # # Take the first act for testing
    test_act_data = acts_data[0]

    # Verify required fields are present
    assert "title" in test_act_data, "Act missing title"
    assert "ELI" in test_act_data, "Act missing ELI"
    assert "announcementDate" in test_act_data, "Act missing announcementDate"

    # # Process and save using real ActProcessor
    success = processor.process_and_save(test_act_data)

    assert success is True, "Failed to process and save act"

    # # Verify act was saved to database
    act_number = test_act_data["ELI"].split("/")[-1]
    saved_act = repo.get_act_by_number(act_number)

    assert saved_act is not None, "Act not found in database after processing"
    assert saved_act.title == test_act_data["title"], "Saved act title mismatch"
    assert saved_act.file is not None, "PDF URL not generated"
    assert saved_act.file.startswith("https://"), "Invalid PDF URL format"
