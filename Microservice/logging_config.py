from loguru import logger
import sys

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
    """Configure Loguru for Azure Functions (Console only)"""

    # Remove default handler
    logger.remove()

    # Console handler - Azure captures this automatically
    logger.add(
        sys.stdout,
        format=formatter,
        level="DEBUG",
        colorize=True,
        enqueue=True,  # Thread-safe
    )

    return logger

if __name__ == '__main__':
    # Test logic
    logger = setup_loguru()
    try:
        50 / 0
    except Exception:
        logger.exception('Test Exception')