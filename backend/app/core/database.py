from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Initialize Async MongoDB Client with Atlas URL
client = AsyncIOMotorClient(settings.MONGO_URL)
database = client[settings.DATABASE_NAME]

# Collections for CreatorIQ
users_collection = database["users"]
content_collection = database["content"]
analytics_collection = database["analytics"]
platform_accounts_collection = database["platform_accounts"]
notifications_collection = database["notifications"]

async def ping_database() -> bool:
    """Helper to test live MongoDB Atlas connectivity."""
    try:
        await client.admin.command("ping")
        return True
    except Exception as e:
        print(f"MongoDB Atlas ping failed: {e}")
        return False

NOTIFICATION_TTL_SECONDS = 2 * 24 * 3600  # 2 days (172,800 seconds)

async def init_db_indexes():
    """Ensure MongoDB TTL indexes exist so notifications do not consume database storage."""
    try:
        await notifications_collection.create_index(
            "created_at",
            expireAfterSeconds=NOTIFICATION_TTL_SECONDS,
            name="notifications_ttl_2days"
        )
        await notifications_collection.create_index(
            [("user_id", 1), ("created_at", -1)],
            name="notifications_user_lookup"
        )
    except Exception as e:
        print(f"MongoDB index setup notice: {e}")

