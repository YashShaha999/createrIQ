from pydantic import BaseModel
from typing import Optional

class ContentCreate(BaseModel):
    title: str
    platform: str = "youtube"
    views: Optional[int] = 0
    likes: Optional[int] = 0
    comments: Optional[int] = 0
    shares: Optional[int] = 0
    engagement_rate: Optional[float] = 0.0
