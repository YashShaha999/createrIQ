from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "creator"
    bio: Optional[str] = ""
    profile_picture: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None
