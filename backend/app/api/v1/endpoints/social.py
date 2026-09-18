from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import notifications_collection
from app.utils.dependencies import get_current_user
from app.services import social_service

router = APIRouter(prefix="/api/social", tags=["Social"])

def _uid(user: dict) -> str:
    return str(user.get("id") or user.get("_id") or user.get("email") or "demo_user")

# ---------- Connections ----------

@router.get("/connections")
async def my_connections(user=Depends(get_current_user)):
    user_id = _uid(user)
    connected = await social_service.list_connections(user_id)
    return {
        "user_id": user_id,
        "all_platforms": social_service.PLATFORMS,
        "connected": connected,
        "not_connected": [p for p in social_service.PLATFORMS if p not in connected],
    }

@router.post("/{platform}/connect")
async def connect_platform(platform: str, user=Depends(get_current_user)):
    user_id = _uid(user)
    res = await social_service.connect(user_id, platform)

    await notifications_collection.insert_one({
        "user_id": user.get("id") or user_id,
        "type": "platform_connected",
        "title": f"{platform.title()} connected",
        "message": f"Your {platform} account is now linked.",
        "read": False,
        "created_at": datetime.utcnow(),
    })

    connected = await social_service.list_connections(user_id)
    return {
        **res,
        "connected": connected,
        "active_connections": connected,
        "connected_platforms": connected,
        "not_connected": [p for p in social_service.PLATFORMS if p not in connected],
        "all_platforms": social_service.PLATFORMS,
    }

@router.post("/{platform}/disconnect")
async def disconnect_platform(platform: str, user=Depends(get_current_user)):
    user_id = _uid(user)
    res = await social_service.disconnect(user_id, platform)
    connected = await social_service.list_connections(user_id)
    return {
        **res,
        "connected": connected,
        "active_connections": connected,
        "connected_platforms": connected,
        "not_connected": [p for p in social_service.PLATFORMS if p not in connected],
        "all_platforms": social_service.PLATFORMS,
    }

# ---------- Resources ----------

@router.get("/{platform}/profile")
async def profile(platform: str, user=Depends(get_current_user)):
    user_id = _uid(user)
    return await social_service.get_profile(user_id, platform)

@router.get("/{platform}/content")
async def content(platform: str, user=Depends(get_current_user)):
    user_id = _uid(user)
    return await social_service.get_content(user_id, platform)

@router.get("/{platform}/demographics")
async def demographics(platform: str, user=Depends(get_current_user)):
    user_id = _uid(user)
    return await social_service.get_demographics(user_id, platform)

@router.get("/{platform}/revenue")
async def revenue(platform: str, user=Depends(get_current_user)):
    user_id = _uid(user)
    return await social_service.get_revenue(user_id, platform)

@router.get("/{platform}/growth")
async def growth(platform: str, user=Depends(get_current_user)):
    user_id = _uid(user)
    return await social_service.get_growth(user_id, platform)

# ---------- Legacy compatibility (keep Milestone 1 working) ----------

@router.get("/status")
async def legacy_status(user=Depends(get_current_user)):
    """Old shape — frontend or earlier tests may still call this."""
    user_id = _uid(user)
    connected = await social_service.list_connections(user_id)
    return {"platforms": {p: (p in connected) for p in social_service.PLATFORMS}}

@router.get("/{platform}/data")
async def legacy_data(platform: str, user=Depends(get_current_user)):
    """Old shape — returns profile + content merged."""
    user_id = _uid(user)
    try:
        prof = await social_service.get_profile(user_id, platform)
    except HTTPException:
        prof = None
    try:
        cnt = await social_service.get_content(user_id, platform)
    except HTTPException:
        cnt = []
    return {"profile": prof, "content": cnt}
