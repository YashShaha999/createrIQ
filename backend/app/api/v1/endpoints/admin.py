from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
from bson import ObjectId
import os
import httpx
from app.core.database import (
    users_collection,
    content_collection,
    platform_accounts_collection,
)
from app.core.security import hash_password
from app.utils.dependencies import require_role
from app.schemas.user import RoleUpdate, AdminUserCreate, UserResponse

router = APIRouter(prefix="/api/admin", tags=["Admin"])
simple_router = APIRouter(prefix="/admin", tags=["Admin (Legacy)"])

admin_only = require_role("admin")

@router.get("/stats")
@simple_router.get("/stats")
async def platform_stats(_=Depends(admin_only)):
    total_users = await users_collection.count_documents({})
    total_content = await content_collection.count_documents({})
    total_connections = await platform_accounts_collection.count_documents({})

    role_agg = users_collection.aggregate([
        {"$group": {"_id": "$role", "count": {"$sum": 1}}}
    ])
    roles = {r["_id"]: r["count"] async for r in role_agg}

    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_7d = await users_collection.count_documents(
        {"created_at": {"$gte": week_ago}}
    )

    return {
        "total_users": total_users,
        "total_content": total_content,
        "total_connections": total_connections,
        "new_users_7d": new_users_7d,
        "roles": roles,
    }

@router.get("/users")
@simple_router.get("/users")
async def list_users(_=Depends(admin_only)):
    users = []
    async for u in users_collection.find().sort("created_at", -1):
        uid = str(u["_id"])
        u["id"] = uid
        u.pop("_id", None)
        u.pop("password_hash", None)
        # Attach connection count
        try:
            u["connected_platforms"] = await platform_accounts_collection.count_documents(
                {"user_id": uid}
            )
        except Exception:
            u["connected_platforms"] = 0
        users.append(u)
    return users

@router.post("/users", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
@simple_router.post("/users", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_user(new_user: AdminUserCreate, _=Depends(admin_only)):
    email = new_user.email.lower().strip()
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    clean_role = new_user.role.lower().strip()
    if clean_role not in ["creator", "admin"]:
        clean_role = "creator"

    now = datetime.utcnow()
    user_doc = {
        "name": new_user.name.strip(),
        "full_name": new_user.name.strip(),
        "email": email,
        "password_hash": hash_password(new_user.password),
        "role": clean_role,
        "bio": "",
        "social_links": {
            "youtube": "",
            "instagram": "",
            "twitter": ""
        },
        "profile_picture": None,
        "created_at": now,
        "platform_accounts": []
    }

    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    return UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=email,
        role=clean_role,
        bio="",
        social_links=user_doc["social_links"],
        created_at=now
    )

@router.get("/activity")
@simple_router.get("/activity")
async def recent_activity(limit: int = 20, _=Depends(admin_only)):
    items = []
    async for u in users_collection.find().sort("created_at", -1).limit(limit):
        items.append({
            "type": "user_registered",
            "name": u.get("name"),
            "email": u.get("email"),
            "role": u.get("role"),
            "at": u.get("created_at"),
        })
    return items

@router.get("/system-health")
@simple_router.get("/system-health")
async def system_health(_=Depends(admin_only)):
    mock_url = os.getenv("MOCK_API_URL", "http://localhost:9000")
    health = {
        "backend": "ok",
        "mongodb": "unknown",
        "mock_api": "unknown",
        "checked_at": datetime.utcnow().isoformat(),
    }
    try:
        await users_collection.database.command("ping")
        health["mongodb"] = "ok"
    except Exception as e:
        health["mongodb"] = f"error: {e}"

    try:
        async with httpx.AsyncClient(timeout=3) as c:
            r = await c.get(f"{mock_url}/")
            health["mock_api"] = "ok" if r.status_code == 200 else f"http {r.status_code}"
    except Exception:
        health["mock_api"] = "unreachable"

    return health

@router.get("/content")
@simple_router.get("/content")
async def all_content(limit: int = 100, _=Depends(admin_only)):
    """All custom content from all users (for moderation)."""
    items = []
    async for c in content_collection.find().sort("created_at", -1).limit(limit):
        c["id"] = str(c["_id"])
        c.pop("_id", None)
        items.append(c)
    return items

@router.put("/users/{user_id}/role")
@router.patch("/users/{user_id}/role")
@simple_router.put("/users/{user_id}/role")
@simple_router.patch("/users/{user_id}/role")
async def change_user_role(user_id: str, payload: dict, _=Depends(admin_only)):
    new_role = payload.get("role", "").lower().strip()
    if new_role not in ["creator", "admin"]:
        raise HTTPException(400, "Role must be 'creator' or 'admin'")

    query = {}
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"email": user_id}

    result = await users_collection.update_one(
        query, {"$set": {"role": new_role}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "User not found")
    return {"updated": True, "new_role": new_role, "role": new_role, "user_id": user_id}

@router.delete("/users/{user_id}")
@simple_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(admin_only)):
    admin_id = str(admin.get("_id") or admin.get("id"))
    if admin_id == str(user_id) or admin.get("email") == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operation rejected: You cannot delete your own active administrator account!"
        )

    query = {}
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"email": user_id}

    target = await users_collection.find_one(query)
    if not target:
        raise HTTPException(404, "User not found")

    if str(target.get("_id")) == admin_id or target.get("email") == admin.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operation rejected: You cannot delete your own active administrator account!"
        )

    res = await users_collection.delete_one(query)
    if res.deleted_count == 0:
        raise HTTPException(404, "User not found")

    return {"deleted": True, "message": "User deleted successfully from database", "user_id": str(target["_id"])}
