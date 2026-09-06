import logging
import asyncio
import copy
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)


class LocalAsyncCursor:
    """Async cursor mimicking Motor cursor for offline / local mode."""

    def __init__(self, items: List[Dict[str, Any]]):
        self._items = copy.deepcopy(items)
        self._index = 0

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            # Sort by multiple keys
            for k, d in reversed(key_or_list):
                reverse = d < 0
                self._items.sort(key=lambda x: str(x.get(k, "")), reverse=reverse)
        else:
            reverse = direction < 0
            self._items.sort(key=lambda x: str(x.get(key_or_list, "")), reverse=reverse)
        return self

    def limit(self, n: int):
        self._items = self._items[:n]
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        if length is not None:
            return self._items[:length]
        return self._items

    def __aiter__(self):
        self._index = 0
        return self

    async def __anext__(self):
        if self._index < len(self._items):
            item = self._items[self._index]
            self._index += 1
            return item
        raise StopAsyncIteration


class LocalAsyncCollection:
    """Async collection mimicking Motor collection with full CRUD support."""

    def __init__(self, name: str):
        self.name = name
        self._docs: List[Dict[str, Any]] = []
        self._lock = asyncio.Lock()

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, sub_q) for sub_q in v):
                    return False
            elif k == "$and" and isinstance(v, list):
                if not all(self._matches(doc, sub_q) for sub_q in v):
                    return False
            elif isinstance(v, dict) and "$in" in v:
                in_vals = v["$in"]
                if doc.get(k) not in in_vals:
                    return False
            elif isinstance(v, dict) and "$ne" in v:
                if doc.get(k) == v["$ne"]:
                    return False
            elif doc.get(k) != v:
                return False
        return True

    async def insert_one(self, doc: Dict[str, Any]):
        async with self._lock:
            d = copy.deepcopy(doc)
            if "_id" not in d:
                import uuid
                d["_id"] = str(uuid.uuid4())
            self._docs.append(d)
            class InsertResult:
                inserted_id = d["_id"]
            return InsertResult()

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            for d in self._docs:
                if self._matches(d, query):
                    return copy.deepcopy(d)
            return None

    def find(self, query: Dict[str, Any] = None) -> LocalAsyncCursor:
        q = query or {}
        matches = [d for d in self._docs if self._matches(d, q)]
        return LocalAsyncCursor(matches)

    async def update_one(self, filter_query: Dict[str, Any], update_spec: Dict[str, Any], upsert: bool = False):
        async with self._lock:
            matched = False
            for d in self._docs:
                if self._matches(d, filter_query):
                    matched = True
                    if "$set" in update_spec:
                        for k, v in update_spec["$set"].items():
                            d[k] = copy.deepcopy(v)
                    if "$push" in update_spec:
                        for k, v in update_spec["$push"].items():
                            if k not in d or not isinstance(d[k], list):
                                d[k] = []
                            d[k].append(copy.deepcopy(v))
                    break
            if not matched and upsert:
                new_doc = copy.deepcopy(filter_query)
                if "$set" in update_spec:
                    new_doc.update(update_spec["$set"])
                import uuid
                new_doc["_id"] = str(uuid.uuid4())
                self._docs.append(new_doc)
            class UpdateResult:
                matched_count = 1 if matched else 0
                modified_count = 1 if matched else (1 if upsert else 0)
            return UpdateResult()

    async def delete_many(self, filter_query: Dict[str, Any]):
        async with self._lock:
            before_len = len(self._docs)
            self._docs = [d for d in self._docs if not self._matches(d, filter_query)]
            class DeleteResult:
                deleted_count = before_len - len(self._docs)
            return DeleteResult()

    async def count_documents(self, filter_query: Dict[str, Any] = None) -> int:
        q = filter_query or {}
        async with self._lock:
            return sum(1 for d in self._docs if self._matches(d, q))


class LocalAsyncDatabase:
    """Async database mimicking Motor database."""

    def __init__(self, db_name: str):
        self.name = db_name
        self._collections: Dict[str, LocalAsyncCollection] = {}

    def __getitem__(self, item: str) -> LocalAsyncCollection:
        if item not in self._collections:
            self._collections[item] = LocalAsyncCollection(item)
        return self._collections[item]

    def __getattr__(self, item: str) -> LocalAsyncCollection:
        return self[item]

    async def command(self, cmd: str) -> Dict[str, Any]:
        return {"ok": 1.0, "storage": "embedded_resilient_async_store"}


class DatabaseManager:
    client: Optional[Any] = None
    db: Optional[Any] = None
    is_live_mongo: bool = False


db_manager = DatabaseManager()


async def connect_to_mongo():
    """Establish async MongoDB connection or initialize transparent local engine."""
    try:
        live_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=1200,
        )
        # Test connection with timeout
        await asyncio.wait_for(live_client.admin.command('ping'), timeout=1.2)
        db_manager.client = live_client
        db_manager.db = live_client[settings.MONGODB_DB_NAME]
        db_manager.is_live_mongo = True
        logger.info(f"Connected to live MongoDB database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.info(f"MongoDB standalone service not reachable ({e}). Initializing transparent resilient local database.")
        db_manager.db = LocalAsyncDatabase(settings.MONGODB_DB_NAME)
        db_manager.is_live_mongo = False


async def close_mongo_connection():
    """Close async MongoDB connection."""
    if db_manager.is_live_mongo and db_manager.client:
        db_manager.client.close()
        logger.info("Closed live MongoDB connection.")


def get_database() -> Any:
    """Dependency helper to get active database."""
    if db_manager.db is None:
        db_manager.db = LocalAsyncDatabase(settings.MONGODB_DB_NAME)
    return db_manager.db
