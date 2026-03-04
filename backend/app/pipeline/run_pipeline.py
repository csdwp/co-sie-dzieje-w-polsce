from ..core.logging import get_logger
from .orchestrator import check_for_new_acts, check_old_elis

logger = get_logger(__name__)


if __name__ == "__main__":
    logger.info("Starting CO-SIE-DZIEJE-W-POLSCE backend pipeline")

    new_acts = check_for_new_acts()
    delayed_acts = check_old_elis()

    logger.info("Pipeline execution completed")

    all_processed = new_acts + delayed_acts
    if all_processed:
        print(f"\nAdded {len(all_processed)} act(s):")
        for title in all_processed:
            print(f"  - {title}")
    else:
        print("\nNo new acts added.")
