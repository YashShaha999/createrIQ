import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "CreatorIQ API"
    PROJECT_DESCRIPTION: str = "Creator Analytics & Influencer Management Dashboard API (Milestone 1)"
    PROJECT_VERSION: str = "1.0.0"

    MONGO_URL: str = os.getenv(
        "MONGO_URL",
        "mongodb+srv://yashshaha999_db_user:MNeu9DCyR42Ycn57@cluster0.xswno2v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-12345-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
