import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db_manager = DatabaseManager()


async def connect_to_mongo():
    """Establish async MongoDB connection."""
    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]
        logger.info(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.warning(f"MongoDB connection fallback / deferred: {e}")


async def close_mongo_connection():
    """Close async MongoDB connection."""
    if db_manager.client:
        db_manager.client.close()
        logger.info("Closed MongoDB connection.")


def get_database() -> AsyncIOMotorDatabase:
    """Dependency helper to get active database."""
    return db_manager.db
