from fastapi import APIRouter
from datetime import datetime
from app.db.session import client

router = APIRouter()

# 🚀 API Root Discovery
@router.get("/")
async def root():
    return {
        "message": "🚀 CreatorIQ API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": [
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/me",
            "/api/analytics/dashboard",
            "/api/analytics/content",
            "/api/analytics/growth",
            "/api/content",
            "/api/admin/users",
            "/api/health"
        ]
    }

# 🩺 Database & API Health Check
@router.get("/api/health")
async def health_check():
    try:
        await client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "MongoDB Atlas - Connected ✅",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": f"MongoDB Atlas - Disconnected ({str(e)}) ❌",
            "timestamp": datetime.utcnow().isoformat()
        }
