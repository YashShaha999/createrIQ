import os
import httpx
from fastapi import HTTPException

MOCK = os.getenv("MOCK_API_URL", "http://localhost:9000")
PLATFORMS = ["youtube", "instagram", "facebook", "x"]

# Aliases: frontend may send "twitter" → normalize to "x"
ALIASES = {"twitter": "x", "yt": "youtube", "ig": "instagram", "fb": "facebook"}

# Per-platform content resource mapping
CONTENT_RESOURCE = {
    "youtube":   "videos",
    "instagram": "media",
    "facebook":  "posts",
    "x":         "tweets",
}

def _normalize(platform: str) -> str:
    p = platform.lower().strip()
    return ALIASES.get(p, p)


def _url(platform: str, user_id: str, resource: str) -> str:
    return f"{MOCK}/mock/{platform}/{user_id}/{resource}"


_client = httpx.AsyncClient(
    timeout=httpx.Timeout(3.0, connect=1.5),
    limits=httpx.Limits(max_keepalive_connections=20, max_connections=50)
)


async def _request(method: str, url: str):
    try:
        r = await _client.request(method, url)
    except (httpx.ConnectError, httpx.TimeoutException):
        return None
    except Exception:
        return None

    if r.status_code == 403:
        try:
            detail = r.json().get("detail", "Platform not connected")
        except Exception:
            detail = "Platform not connected"
        raise HTTPException(403, detail)
    if r.status_code == 404:
        raise HTTPException(404, f"Resource not found: {url}")
    if r.status_code >= 400:
        return None
    return r.json()


# ---------- Public API (Strict Mock API Only - No Local Fallbacks) ----------

async def connect(user_id: str, platform: str):
    p = _normalize(platform)
    data = await _request("POST", _url(p, user_id, "connect"))
    if data is None:
        raise HTTPException(
            status_code=503,
            detail="Mock Social Media API is offline on port 9000. Start mock-api to connect channels."
        )
    return data


async def disconnect(user_id: str, platform: str):
    p = _normalize(platform)
    data = await _request("POST", _url(p, user_id, "disconnect"))
    if data is None:
        raise HTTPException(
            status_code=503,
            detail="Mock Social Media API is offline on port 9000. Start mock-api to manage channels."
        )
    return data


async def list_connections(user_id: str) -> list[str]:
    """Returns connected platforms from the live Mock API. Returns empty list if Mock API is offline."""
    try:
        data = await _request("GET", f"{MOCK}/mock/{user_id}/connections")
        if data is not None and "connected" in data:
            return sorted(data.get("connected", []))
    except HTTPException:
        pass
    return []


async def get_resource(user_id: str, platform: str, resource: str):
    p = _normalize(platform)
    try:
        data = await _request("GET", _url(p, user_id, resource))
        if data is not None:
            return data
    except HTTPException as e:
        if e.status_code == 403:
            raise
        if e.status_code != 404:
            raise

    # Direct key resolution for mock datasets
    if resource in ("revenue_trends", "sponsorships"):
        import json
        from pathlib import Path
        mock_file = Path(__file__).resolve().parents[3] / "mock-api" / "app" / "data" / f"{p}.json"
        if mock_file.exists():
            with open(mock_file, "r", encoding="utf-8") as f:
                return json.load(f).get(resource, [])

    raise HTTPException(
        status_code=503,
        detail=f"Mock Social Media API is offline on port 9000. Cannot fetch {resource} for {platform}."
    )


# ---------- Convenience ----------

async def get_profile(u, p):       return await get_resource(u, p, "profile")
async def get_demographics(u, p):  return await get_resource(u, p, "demographics")
async def get_revenue(u, p):       return await get_resource(u, p, "revenue")
async def get_growth(u, p):        return await get_resource(u, p, "growth")


async def get_content(user_id: str, platform: str):
    p = _normalize(platform)
    if p not in CONTENT_RESOURCE:
        raise HTTPException(400, f"Unsupported platform: {platform}")
    return await get_resource(user_id, p, CONTENT_RESOURCE[p])
