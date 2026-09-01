from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from app.schemas.user import UserCreate, UserLogin, UserUpdate
from app.core.security import hash_password, verify_password, create_access_token
from app.db.session import users_collection
from app.db.init_db import ensure_demo_users
from app.api.deps import get_current_user

router = APIRouter()

# 📝 Register User
@router.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
@router.post("/api/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    email = user.email.lower().strip()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    role = user.role.lower().strip()
    if role not in ["creator", "admin"]:
        role = "creator"

    now = datetime.utcnow()
    user_dict = {
        "email": email,
        "password": hash_password(user.password),
        "full_name": user.full_name.strip(),
        "role": role,
        "bio": user.bio or "",
        "profile_picture": user.profile_picture or "",
        "social_links": {
            "youtube": "",
            "instagram": "",
            "tiktok": "",
            "twitter": ""
        },
        "created_at": now,
        "updated_at": now,
        "is_active": True
    }
    
    insert_result = await users_collection.insert_one(user_dict)
    
    # Generate token
    token = create_access_token({"sub": email, "role": role})
    
    return {
        "success": True,
        "message": "User registered successfully! 🎉",
        "token": token,
        "user": {
            "id": str(insert_result.inserted_id),
            "email": email,
            "full_name": user.full_name.strip(),
            "role": role,
            "bio": user.bio or "",
            "profile_picture": user.profile_picture or "",
            "social_links": user_dict["social_links"],
            "created_at": now.isoformat()
        }
    }

# 🔑 Login User
@router.post("/api/auth/login")
@router.post("/api/login")
async def login(user: UserLogin):
    email = user.email.lower().strip()
    
    db_user = await users_collection.find_one({"email": email})
    
    # Auto-heal: If database was cleared/deleted and user is logging in with demo credentials
    if not db_user:
        if (email == "admin@creatoriq.com" and user.password == "adminpass123") or \
           (email == "alex.creator@creatoriq.com" and user.password == "password123"):
            await ensure_demo_users()
            db_user = await users_collection.find_one({"email": email})
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user.password, db_user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    await users_collection.update_one(
        {"email": email},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    role = db_user.get("role", "creator")
    token = create_access_token({"sub": email, "role": role})
    
    return {
        "success": True,
        "message": "Login successful! 🔑",
        "token": token,
        "user": {
            "id": str(db_user["_id"]),
            "email": db_user["email"],
            "full_name": db_user.get("full_name", ""),
            "role": role,
            "bio": db_user.get("bio", ""),
            "profile_picture": db_user.get("profile_picture", ""),
            "social_links": db_user.get("social_links", {}),
            "created_at": db_user.get("created_at")
        }
    }

# 🔐 Get Current User Profile
@router.get("/api/auth/me")
@router.get("/api/profile")
async def get_me(current_user = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "full_name": current_user.get("full_name", ""),
        "role": current_user.get("role", "creator"),
        "bio": current_user.get("bio", ""),
        "profile_picture": current_user.get("profile_picture", ""),
        "social_links": current_user.get("social_links", {}),
        "created_at": current_user.get("created_at")
    }

# ✏️ Update Profile
@router.put("/api/auth/me")
@router.put("/api/profile")
async def update_me(update_data: UserUpdate, current_user = Depends(get_current_user)):
    update_dict = {}
    if update_data.full_name is not None:
        update_dict["full_name"] = update_data.full_name.strip()
    if update_data.bio is not None:
        update_dict["bio"] = update_data.bio.strip()
    if update_data.profile_picture is not None:
        update_dict["profile_picture"] = update_data.profile_picture.strip()
    if update_data.social_links is not None:
        update_dict["social_links"] = update_data.social_links
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No data provided to update")
    
    update_dict["updated_at"] = datetime.utcnow()
    
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": update_dict}
    )
    
    updated_user = await users_collection.find_one({"email": current_user["email"]})
    
    return {
        "success": True,
        "message": "Profile updated successfully! ✅",
        "user": {
            "id": str(updated_user["_id"]),
            "email": updated_user["email"],
            "full_name": updated_user.get("full_name", ""),
            "role": updated_user.get("role", "creator"),
            "bio": updated_user.get("bio", ""),
            "profile_picture": updated_user.get("profile_picture", ""),
            "social_links": updated_user.get("social_links", {})
        }
    }
