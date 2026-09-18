from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import datetime

# Student Project: Simple Role-Based Access Control (Creator & Admin only)
PUBLIC_ROLES = ["creator", "admin"]
VALID_ROLES = PUBLIC_ROLES

class UserRegister(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = "creator"  # Default role is creator

    @model_validator(mode="after")
    def check_name_and_role(self):
        # Allow either 'name' or 'full_name'
        if not (self.name or self.full_name):
            raise ValueError("Provide either 'name' or 'full_name'")
        if not self.name and self.full_name:
            self.name = self.full_name
        elif not self.full_name and self.name:
            self.full_name = self.name
        
        # Only allow creator or admin
        clean_role = (self.role or "creator").lower().strip()
        if clean_role not in PUBLIC_ROLES:
            raise ValueError(f"Role must be one of {PUBLIC_ROLES}")
        self.role = clean_role
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    bio: Optional[str] = None
    social_links: Optional[dict] = None
    created_at: datetime

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    social_links: Optional[dict] = None

class RoleUpdate(BaseModel):
    role: str

class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = "creator"

class TokenResponse(BaseModel):
    access_token: str
    token: str
    token_type: str = "bearer"
    user: UserResponse

# Backward compatibility aliases
UserCreate = UserRegister
UserUpdate = UserRegister

