import os
import asyncio
import httpx
from typing import Any, Dict, List, Optional
from fastapi import HTTPException
from app.core.config import settings

MOCK_API_URL = settings.MOCK_API_URL or os.getenv("MOCK_API_URL", "http://localhost:9000")

def normalize_platform(platform: str) -> str:
    p = (platform or "").strip().lower()
    return "x" if p in ("twitter", "x") else p

async def _get(path: str) -> Any:
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            res = await client.get(f"{MOCK_API_URL}{path}")
            if res.status_code == 403:
                raise HTTPException(status_code=403, detail="Platform not connected")
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=res.text)
            return res.json()
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Mock Social API is offline on port 9000")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

async def _post(path: str, data: Optional[Dict[str, Any]] = None) -> Any:
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            res = await client.post(f"{MOCK_API_URL}{path}", json=data or {})
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=res.text)
            return res.json()
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Mock Social API is offline on port 9000")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

async def get_user_connections(user_id: str) -> List[str]:
    data = await _get(f"/mock/{user_id}/connections")
    return data.get("connected", [])

async def is_platform_connected(user_id: str, platform: str) -> bool:
    p = normalize_platform(platform)
    connections = await get_user_connections(user_id)
    return p in connections

async def connect_platform(user_id: str, platform: str) -> Dict[str, Any]:
    p = normalize_platform(platform)
    return await _post(f"/mock/{p}/{user_id}/connect")

async def disconnect_platform(user_id: str, platform: str) -> Dict[str, Any]:
    p = normalize_platform(platform)
    return await _post(f"/mock/{p}/{user_id}/disconnect")

async def get_platform_profile(user_id: str, platform: str) -> Dict[str, Any]:
    p = normalize_platform(platform)
    return await _get(f"/mock/{p}/{user_id}/profile")

async def get_platform_content(user_id: str, platform: str, limit: int = 25) -> Any:
    p = normalize_platform(platform)
    content_key = "videos" if p == "youtube" else "media" if p == "instagram" else "posts" if p == "facebook" else "tweets"
    return await _get(f"/mock/{p}/{user_id}/{content_key}?limit={limit}")

async def get_platform_demographics(user_id: str, platform: str) -> Dict[str, Any]:
    p = normalize_platform(platform)
    return await _get(f"/mock/{p}/{user_id}/demographics")

async def get_platform_revenue(user_id: str, platform: str) -> Dict[str, Any]:
    p = normalize_platform(platform)
    return await _get(f"/mock/{p}/{user_id}/revenue")

async def get_platform_growth(user_id: str, platform: str) -> Any:
    p = normalize_platform(platform)
    return await _get(f"/mock/{p}/{user_id}/growth")

async def get_platform_all_data(user_id: str, platform: str) -> Dict[str, Any]:
    p = normalize_platform(platform)
    results = await asyncio.gather(
        get_platform_profile(user_id, p),
        get_platform_content(user_id, p),
        get_platform_demographics(user_id, p),
        get_platform_revenue(user_id, p),
        get_platform_growth(user_id, p),
        return_exceptions=True
    )
    profile, content, demographics, revenue, growth = results

    if isinstance(profile, HTTPException) and profile.status_code == 403:
        raise profile

    return {
        "platform": p,
        "profile": profile if not isinstance(profile, Exception) else None,
        "content": content if not isinstance(content, Exception) else [],
        "demographics": demographics if not isinstance(demographics, Exception) else {},
        "revenue": revenue if not isinstance(revenue, Exception) else {},
        "growth": growth if not isinstance(growth, Exception) else []
    }
