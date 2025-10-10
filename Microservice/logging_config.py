from loguru import logger
import sys
from pathlib import Path


def formatter(record):
    # Get class_name with fallback
    class_name = record["extra"].get("class_name", "")

    # Escape angle brackets in function name to prevent tag interpretation
    function_name = str(record['function']).replace('<', '\\<').replace('>', '\\>')

    # Format the class name part
    class_part = f":{class_name}" if class_name else ""

    return (
        f"<green>{record['time']:YYYY-MM-DD HH:mm:ss}</green> | "
        f"<level>{record['level'].name: <8}</level> | "
        f"<cyan>{record['name']}</cyan>"
        f"<magenta>{class_part}</magenta>:"
        f"<cyan>{function_name}</cyan>:"
        f"<cyan>{record['line']}</cyan> - "
        f"<level>{record['message']}</level>\n"
    )
def setup_loguru():
    """Configure Loguru for Django application"""

    # Remove default handler
    logger.remove()

    # Console handler for development
    logger.add(
        sys.stdout,
        format=formatter,
        level="DEBUG",
        colorize=True,
        enqueue=True,  # Thread-safe
    )

    # File handler for all logs
    logger.add(
        "logs/app.log",
        format=formatter,
        level="DEBUG",
        rotation='weekly',
        retention="4 weeks",
        enqueue=True,
        backtrace=True,
        diagnose=True
    )

    # File handler for errors only
    logger.add(
        "logs/errors.log",
        format=formatter,
        level="ERROR",
        rotation='weekly',
        retention="4 weeks",
        enqueue=True,
        backtrace=True,
        diagnose=True
    )

    return logger


# Create logs directory
def ensure_logs_directory():
    logs_dir = Path("./logs")
    logs_dir.mkdir(exist_ok=True)


# Initialize on import
ensure_logs_directory()


if __name__ == '__main__':
    logger = setup_loguru()

    try:
        50 / 0
    except Exception:
        logger.exception('AAA')