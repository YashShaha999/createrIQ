from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse, ProfileUpdate
from app.core.database import users_collection
from app.core.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

# Simple Student Project Routers: supports both /auth and /api/auth
router = APIRouter(prefix="/auth", tags=["Authentication"])
api_router = APIRouter(prefix="/api/auth", tags=["Authentication (v1)"])

async def _register(user: UserRegister):
    email = user.email.lower().strip()
    
    # Check if user already exists in database
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered! Please login instead."
        )

    display_name = (user.name or user.full_name or "").strip()
    role = "admin" if user.role.lower() == "admin" else "creator"
    now = datetime.utcnow()

    new_user = {
        "name": display_name,
        "full_name": display_name,
        "email": email,
        "password_hash": hash_password(user.password),
        "role": role,
        "bio": "",
        "social_links": {
            "youtube": "",
            "instagram": "",
            "twitter": "",
            "facebook": ""
        },
        "profile_picture": None,
        "created_at": now,
        "platform_accounts": []
    }

    # Save to MongoDB Atlas
    result = await users_collection.insert_one(new_user)
    user_id = str(result.inserted_id)
    
    # Create JWT Token
    token = create_access_token({"sub": user_id, "role": role})

    return TokenResponse(
        access_token=token,
        token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=display_name,
            email=email,
            role=role,
            bio="",
            social_links=new_user["social_links"],
            created_at=now
        )
    )

async def _login(creds: UserLogin):
    email = creds.email.lower().strip()
    user = await users_collection.find_one({"email": email})

    # Auto-seed student demo accounts on quick-login if database was cleared/empty
    if not user:
        now = datetime.utcnow()
        if (email == "creator@test.com" and creds.password == "password123") or \
           (email == "creator@creatoriq.com" and creds.password in ("demo1234", "password123")) or \
           (email == "alex.creator@creatoriq.com" and creds.password == "password123"):
            new_user = {
                "name": "Sarah Creator",
                "full_name": "Sarah Creator",
                "email": email,
                "password_hash": hash_password(creds.password),
                "role": "creator",
                "bio": "Tech reviewer & digital creator streaming multi-channel reviews and tutorials.",
                "social_links": {
                    "youtube": "https://youtube.com/@techwithyash",
                    "instagram": "https://instagram.com/techwithyash",
                    "facebook": "https://facebook.com/techwithyash",
                    "twitter": "https://x.com/techwithyash"
                },
                "profile_picture": None,
                "created_at": now,
                "platform_accounts": []
            }
            res = await users_collection.insert_one(new_user)
            user = new_user
            user["_id"] = res.inserted_id
        elif (email == "admin@test.com" and creds.password == "adminpassword123") or \
             (email == "admin@creatoriq.com" and creds.password in ("demo1234", "adminpass123")):
            new_user = {
                "name": "Alex Admin",
                "full_name": "Alex Admin",
                "email": email,
                "password_hash": hash_password(creds.password),
                "role": "admin",
                "bio": "Lead administrator supervising CreatorIQ platform governance & system operations.",
                "social_links": {
                    "youtube": "",
                    "instagram": "",
                    "twitter": "@admin_creatoriq",
                    "facebook": ""
                },
                "profile_picture": None,
                "created_at": now,
                "platform_accounts": []
            }
            res = await users_collection.insert_one(new_user)
            user = new_user
            user["_id"] = res.inserted_id

    # Verify password
    stored_hash = user.get("password_hash") or user.get("password", "") if user else ""
    if not user or not verify_password(creds.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = str(user["_id"])
    role = "admin" if user.get("role") == "admin" else "creator"
    token = create_access_token({"sub": user_id, "role": role})
    display_name = user.get("name") or user.get("full_name") or email.split("@")[0]

    return TokenResponse(
        access_token=token,
        token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=display_name,
            email=user["email"],
            role=role,
            bio=user.get("bio"),
            social_links=user.get("social_links"),
            created_at=user.get("created_at", datetime.utcnow())
        )
    )

async def _me(user=Depends(get_current_user)):
    display_name = user.get("name") or user.get("full_name") or user["email"].split("@")[0]
    return UserResponse(
        id=user["id"],
        name=display_name,
        email=user["email"],
        role="admin" if user.get("role") == "admin" else "creator",
        bio=user.get("bio"),
        social_links=user.get("social_links"),
        created_at=user.get("created_at", datetime.utcnow())
    )

async def _update_me(data: ProfileUpdate, current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    update_dict = {}

    if data.name is not None and data.name.strip():
        clean_name = data.name.strip()
        update_dict["name"] = clean_name
        update_dict["full_name"] = clean_name

    if data.bio is not None:
        update_dict["bio"] = data.bio.strip()

    if data.social_links is not None:
        update_dict["social_links"] = data.social_links

    if update_dict:
        try:
            await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_dict}
            )
        except Exception:
            await users_collection.update_one(
                {"email": current_user["email"]},
                {"$set": update_dict}
            )

    try:
        updated = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        updated = await users_collection.find_one({"email": current_user["email"]})

    if not updated:
        raise HTTPException(status_code=404, detail="User not found")

    display_name = updated.get("name") or updated.get("full_name") or updated["email"].split("@")[0]
    return UserResponse(
        id=str(updated["_id"]),
        name=display_name,
        email=updated["email"],
        role="admin" if updated.get("role") == "admin" else "creator",
        bio=updated.get("bio"),
        social_links=updated.get("social_links"),
        created_at=updated.get("created_at", datetime.utcnow())
    )

# Register endpoints on both routers
for r in (router, api_router):
    r.post("/register", response_model=TokenResponse)(_register)
    r.post("/login", response_model=TokenResponse)(_login)
    r.get("/me", response_model=UserResponse)(_me)
    r.put("/me", response_model=UserResponse)(_update_me)

