import logging
import asyncio
import time
from typing import Optional, Dict, Any
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)


class LocalAsyncRedis:
    """Async Redis mock engine supporting standard get, set, delete, and ping."""

    def __init__(self):
        self._store: Dict[str, str] = {}
        self._expiry: Dict[str, float] = {}
        self._lock = asyncio.Lock()

    async def ping(self) -> bool:
        return True

    async def get(self, key: str) -> Optional[str]:
        async with self._lock:
            if key in self._expiry and time.time() > self._expiry[key]:
                self._store.pop(key, None)
                self._expiry.pop(key, None)
                return None
            return self._store.get(key)

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        async with self._lock:
            self._store[key] = str(value)
            if ex:
                self._expiry[key] = time.time() + ex
            elif key in self._expiry:
                self._expiry.pop(key, None)
            return True

    async def delete(self, key: str) -> int:
        async with self._lock:
            self._expiry.pop(key, None)
            return 1 if self._store.pop(key, None) is not None else 0

    async def close(self):
        pass


class RedisManager:
    redis_client: Optional[Any] = None
    is_live_redis: bool = False


redis_manager = RedisManager()


async def connect_to_redis():
    """Establish async Redis connection or initialize transparent local cache."""
    try:
        live_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_timeout=1.0,
            socket_connect_timeout=1.0,
        )
        await asyncio.wait_for(live_client.ping(), timeout=1.0)
        redis_manager.redis_client = live_client
        redis_manager.is_live_redis = True
        logger.info(f"Connected to live Redis at {settings.REDIS_URL}")
    except Exception as e:
        logger.info(f"Redis standalone service not reachable ({e}). Initializing transparent resilient local cache.")
        redis_manager.redis_client = LocalAsyncRedis()
        redis_manager.is_live_redis = False


async def close_redis_connection():
    """Close async Redis connection."""
    if redis_manager.redis_client:
        await redis_manager.redis_client.close()
        logger.info("Closed Redis connection.")


def get_redis() -> Any:
    """Dependency helper to get active Redis client."""
    if redis_manager.redis_client is None:
        redis_manager.redis_client = LocalAsyncRedis()
    return redis_manager.redis_client
