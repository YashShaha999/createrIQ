from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional
from app.core.database import content_collection
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/content", tags=["Content Management"])

class ContentCreate(BaseModel):
    title: str
    platform: str
    url: Optional[str] = ""
    views: Optional[int] = 0
    likes: Optional[int] = 0
    comments: Optional[int] = 0
    shares: Optional[int] = 0
    engagement_rate: Optional[float] = 0.0

@router.post("/", status_code=status.HTTP_201_CREATED)
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_content(data: ContentCreate, user=Depends(get_current_user)):
    user_id = user["id"]
    doc = {
        "user_id": user_id,
        "title": data.title,
        "platform": data.platform.lower(),
        "url": data.url or "",
        "views": data.views or 0,
        "likes": data.likes or 0,
        "comments": data.comments or 0,
        "shares": data.shares or 0,
        "engagement_rate": data.engagement_rate or 0.0,
        "created_at": datetime.utcnow()
    }
    result = await content_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["content_id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc

@router.get("/")
@router.get("")
async def list_content(user=Depends(get_current_user)):
    items = []
    async for doc in content_collection.find({"user_id": user["id"]}):
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(doc)
    return {"contents": items, "count": len(items)}

@router.delete("/{content_id}")
async def delete_content(content_id: str, user=Depends(get_current_user)):
    try:
        oid = ObjectId(content_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid content ID")
    res = await content_collection.delete_one({"_id": oid, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content item not found")
    return {"message": "Content item deleted successfully", "id": content_id}

