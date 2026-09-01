from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)
db = client.creatoriq_db

# Collections
users_collection = db.users
analytics_collection = db.analytics
content_collection = db.contents
