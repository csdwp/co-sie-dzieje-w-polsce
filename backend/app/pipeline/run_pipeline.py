from ..core.logging import get_logger
from .orchestrator import check_for_new_acts, check_old_elis

logger = get_logger(__name__)


if __name__ == "__main__":
    logger.info("Starting CO-SIE-DZIEJE-W-POLSCE backend pipeline")

    # Check for new acts
    check_for_new_acts()

    # Check old ELIs (acts waiting for voting data)
    check_old_elis()

    logger.info("Pipeline execution completed")
