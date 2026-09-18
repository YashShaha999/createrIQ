from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.database import notifications_collection
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
async def list_notifications(user=Depends(get_current_user)):
    uid = str(user.get("id") or user.get("_id"))
    items = []
    cursor = notifications_collection.find({"user_id": uid}).sort("created_at", -1).limit(20)
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(doc)
    return items

@router.get("/unread-count")
async def unread_count(user=Depends(get_current_user)):
    uid = str(user.get("id") or user.get("_id"))
    count = await notifications_collection.count_documents({"user_id": uid, "read": False})
    return {"count": count}

@router.post("/{notification_id}/read")
async def mark_read(notification_id: str, user=Depends(get_current_user)):
    uid = str(user.get("id") or user.get("_id"))
    try:
        oid = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    res = await notifications_collection.update_one(
        {"_id": oid, "user_id": uid},
        {"$set": {"read": True}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}

@router.post("/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    uid = str(user.get("id") or user.get("_id"))
    await notifications_collection.update_many(
        {"user_id": uid, "read": False},
        {"$set": {"read": True}}
    )
    return {"ok": True}
