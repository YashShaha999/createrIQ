from fastapi import APIRouter, HTTPException, Depends
from app.db.session import users_collection
from app.api.deps import get_current_user

router = APIRouter()

# 📋 Get All Users (Admin Only)
@router.get("/api/admin/users")
@router.get("/api/users")
async def get_all_users(current_user = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = []
    async for user in users_collection.find({}, {"password": 0}).sort("created_at", -1):
        user["id"] = str(user["_id"])
        del user["_id"]
        users.append(user)
    
    return {"users": users}
