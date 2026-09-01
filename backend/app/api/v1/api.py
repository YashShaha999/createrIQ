from fastapi import APIRouter
from app.api.v1.endpoints import auth, analytics, content, admin, social, health

api_router = APIRouter()

# Include all sub-routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, tags=["Authentication & Profile"])
api_router.include_router(analytics.router, tags=["Analytics"])
api_router.include_router(content.router, tags=["Content Management"])
api_router.include_router(admin.router, tags=["Administration"])
api_router.include_router(social.router, tags=["Social Integration"])
