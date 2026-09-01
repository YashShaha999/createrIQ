import uvicorn
import os
from app.main import app
from app.db.session import client, db, users_collection, analytics_collection, content_collection
from app.core.config import settings

# Export app for uvicorn (uvicorn main:app --reload)
__all__ = [
    "app",
    "client",
    "db",
    "users_collection",
    "analytics_collection",
    "content_collection"
]

if __name__ == "__main__":
    port = int(os.getenv("PORT", settings.PORT))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
