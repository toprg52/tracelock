import json
import logging
import sys
import time
from typing import Any

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data: dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        
        # Include extra context if available
        for key in ["request_id", "user_id", "case_id", "latency", "status_code"]:
            if hasattr(record, key):
                log_data[key] = getattr(record, key)
                
        return json.dumps(log_data)

def setup_logging():
    logger = logging.getLogger("tracelock")
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
    return logger

logger = setup_logging()
