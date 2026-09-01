from fastapi import APIRouter, Depends
from app.api.deps import get_current_user

router = APIRouter()

# 🌐 Get Social Media Integration Status (Mock)
@router.get("/api/social/status")
async def get_social_status(current_user = Depends(get_current_user)):
    return {
        "platforms": [
            {"id": "youtube", "name": "YouTube", "connected": True, "username": "@creator_hub", "followers": "45.2K"},
            {"id": "instagram", "name": "Instagram", "connected": True, "username": "@creator_official", "followers": "32.8K"},
            {"id": "tiktok", "name": "TikTok", "connected": True, "username": "@creator_tok", "followers": "28.5K"},
            {"id": "facebook", "name": "Facebook", "connected": False, "username": "", "followers": "0"}
        ]
    }
