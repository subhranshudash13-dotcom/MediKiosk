import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.core.database import get_database

logger = logging.getLogger(__name__)


class DemoEventLogger:
    """Audit logger for critical safety and AI fallback events into MongoDB 'demo_events'."""

    COLLECTION_NAME = "demo_events"

    async def log_event(
        self,
        event_type: str,
        session_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        severity: str = "INFO"
    ) -> Dict[str, Any]:
        """Logs event with UTC timestamp."""
        db = get_database()
        event_doc = {
            "event_type": event_type,
            "session_id": session_id or "ANONYMOUS",
            "patient_id": patient_id or "P-DEMO",
            "severity": severity,
            "details": details or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        try:
            await db[self.COLLECTION_NAME].insert_one(event_doc)
            logger.info(f"DemoEventLogger: [{severity}] {event_type} - {session_id}")
        except Exception as e:
            logger.warning(f"DemoEventLogger: Failed to persist event ({e})")
        return event_doc

    async def get_recent_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent demo audit events."""
        db = get_database()
        try:
            cursor = db[self.COLLECTION_NAME].find({}).sort("timestamp", -1).limit(limit)
            return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"DemoEventLogger: Failed to read events ({e})")
            return []


event_logger = DemoEventLogger()
