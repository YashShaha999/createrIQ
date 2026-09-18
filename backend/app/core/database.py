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
