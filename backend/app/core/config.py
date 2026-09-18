import os
from dotenv import load_dotenv

# Load variables from .env file into environment
load_dotenv()

class Settings:
    PROJECT_NAME: str = "CreatorIQ API"
    PROJECT_DESCRIPTION: str = "Creator Analytics & Influencer Management Dashboard API"
    PROJECT_VERSION: str = "1.0.0"

    # Support both MONGO_URL and MONGODB_URL
    MONGO_URL: str = os.getenv("MONGO_URL") or os.getenv("MONGODB_URL", "")
    MONGODB_URL: str = os.getenv("MONGODB_URL") or os.getenv("MONGO_URL", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "creatoriq_db")

    # Support both SECRET_KEY and JWT_SECRET
    SECRET_KEY: str = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET", "creatoriq-fallback-secret-2026")
    JWT_SECRET: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "creatoriq-fallback-secret-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

    PORT: int = int(os.getenv("PORT", 8000))
    MOCK_API_URL: str = os.getenv("MOCK_API_URL", "http://localhost:9000")
    USE_MOCK_API: bool = os.getenv("USE_MOCK_API", "true").lower() in ("true", "1", "yes")

settings = Settings()
