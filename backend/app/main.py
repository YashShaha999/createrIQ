from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import ping_database
from app.api.v1.endpoints import auth, analytics, content, admin, social, notifications

app = FastAPI(
    title="CreatorIQ API",
    description="Creator Analytics & Influencer Management Platform",
    version="1.0.0"
)

# CORS Middleware for React frontend on Vite / port 3000 / 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(analytics.router)
app.include_router(auth.api_router)
app.include_router(analytics.api_router)
app.include_router(content.router)
app.include_router(admin.router)
app.include_router(admin.simple_router)
app.include_router(social.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {
        "message": "CreatorIQ API is running 🚀",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health/db")
@app.get("/api/health")
async def health_check():
    connected = await ping_database()
    return {
        "status": "healthy" if connected else "degraded",
        "mongodb": "connected" if connected else "disconnected"
    }
