import logging
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisManager:
    redis_client: aioredis.Redis = None


redis_manager = RedisManager()


async def connect_to_redis():
    """Establish async Redis connection."""
    try:
        redis_manager.redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
        await redis_manager.redis_client.ping()
        logger.info(f"Connected to Redis at {settings.REDIS_URL}")
    except Exception as e:
        logger.warning(f"Redis connection fallback / deferred: {e}")


async def close_redis_connection():
    """Close async Redis connection."""
    if redis_manager.redis_client:
        await redis_manager.redis_client.close()
        logger.info("Closed Redis connection.")


def get_redis():
    """Dependency helper to get active Redis client."""
    return redis_manager.redis_client
