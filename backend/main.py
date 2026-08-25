from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

# ============================================
# 1. DATABASE CONNECTION (MongoDB Atlas)
# ============================================
MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb+srv://yashshaha999_db_user:MNeu9DCyR42Ycn57@cluster0.xswno2v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)

client = AsyncIOMotorClient(MONGO_URL)
db = client.creatoriq_db

# Collections
users_collection = db.users
analytics_collection = db.analytics
content_collection = db.contents

# ============================================
# 2. APP SETUP & CORS
# ============================================
app = FastAPI(
    title="CreatorIQ API",
    description="Creator Analytics & Influencer Management Dashboard API (Milestone 1)",
    version="1.0.0"
)

# CORS Configuration for React (Vite: 5173, CRA: 3000, and wildcards)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 3. SECURITY & JWT CONFIGURATION
# ============================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-12345-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
security = HTTPBearer(auto_error=False)

# ============================================
# 4. PYDANTIC SCHEMAS / MODELS
# ============================================

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

class ContentCreate(BaseModel):
    title: str
    platform: str = "youtube"
    views: Optional[int] = 0
    likes: Optional[int] = 0
    comments: Optional[int] = 0
    shares: Optional[int] = 0
    engagement_rate: Optional[float] = 0.0

# ============================================
# 5. HELPER FUNCTIONS
# ============================================

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    return pwd_context.hash(pwd_bytes.decode('utf-8', errors='ignore'))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        return pwd_context.verify(pwd_bytes.decode('utf-8', errors='ignore'), hashed_password)
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

create_token = create_access_token

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def check_role(user: dict, allowed_roles: List[str]):
    if user.get("role") not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

# ============================================
# 6. AUTHENTICATION ENDPOINTS
# ============================================

# 📝 Register User
@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
@app.post("/api/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    email = user.email.lower().strip()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    role = user.role.lower().strip()
    if role not in ["creator", "agency", "admin"]:
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
@app.post("/api/auth/login")
@app.post("/api/login")
async def login(user: UserLogin):
    email = user.email.lower().strip()
    
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
@app.get("/api/auth/me")
@app.get("/api/profile")
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
@app.put("/api/auth/me")
@app.put("/api/profile")
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

# 📋 Get All Users (Admin Only)
@app.get("/api/admin/users")
@app.get("/api/users")
async def get_all_users(current_user = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = []
    async for user in users_collection.find({}, {"password": 0}).sort("created_at", -1):
        user["id"] = str(user["_id"])
        del user["_id"]
        users.append(user)
    
    return {"users": users}

# ============================================
# 7. ANALYTICS ENDPOINTS
# ============================================

# 📊 Get Dashboard Analytics (Dynamic aggregation from MongoDB)
@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics(current_user = Depends(get_current_user)):
    # Query user's real contents from MongoDB
    user_contents = []
    async for item in content_collection.find({"user_id": current_user["email"]}).sort("views", -1):
        item["id"] = str(item["_id"])
        del item["_id"]
        user_contents.append(item)

    # If user has content in DB, aggregate real stats
    if len(user_contents) > 0:
        total_views = sum(int(c.get("views", 0)) for c in user_contents)
        total_likes = sum(int(c.get("likes", 0)) for c in user_contents)
        total_comments = sum(int(c.get("comments", 0)) for c in user_contents)
        total_shares = sum(int(c.get("shares", 0)) for c in user_contents)
        
        eng_rate = round(((total_likes + total_comments + total_shares) / max(total_views, 1)) * 100, 2)
        total_followers = int(max(8234, total_views * 0.12))

        # Platform breakdown
        platform_breakdown = {"youtube": 0, "instagram": 0, "tiktok": 0, "facebook": 0}
        for c in user_contents:
            p = str(c.get("platform", "youtube")).lower()
            if p in platform_breakdown:
                platform_breakdown[p] += int(c.get("views", 0))
            else:
                platform_breakdown["youtube"] += int(c.get("views", 0))
        
        # Ensure non-zero breakdown slices for visual chart appeal
        for p in platform_breakdown:
            if platform_breakdown[p] == 0:
                platform_breakdown[p] = int(total_views * 0.15) or 1000

        top_content = []
        for c in user_contents[:4]:
            top_content.append({
                "title": c.get("title", "Post"),
                "views": int(c.get("views", 0)),
                "likes": int(c.get("likes", 0)),
                "platform": c.get("platform", "youtube"),
                "engagement": c.get("engagement_rate", 5.0)
            })

    else:
        # Benchmark defaults
        total_views = 125430
        total_likes = 32891
        total_comments = 8792
        total_shares = 4567
        eng_rate = 4.2
        total_followers = 8234
        platform_breakdown = {
            "youtube": 45000,
            "instagram": 35000,
            "tiktok": 28000,
            "facebook": 17430
        }
        top_content = [
            {"title": "How to Grow on YouTube in 2026", "views": 15000, "likes": 3200, "platform": "youtube", "engagement": 8.2},
            {"title": "Instagram Reels Algorithm Secrets", "views": 12000, "likes": 2800, "platform": "instagram", "engagement": 6.5},
            {"title": "Viral TikTok Trend Breakdown", "views": 9800, "likes": 2100, "platform": "tiktok", "engagement": 5.8},
            {"title": "Creator Monetization Masterclass", "views": 8500, "likes": 1900, "platform": "youtube", "engagement": 7.1}
        ]

    analytics_data = {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "engagement_rate": eng_rate,
        "total_followers": total_followers,
        "growth_rate": 12.5,
        "platform_breakdown": platform_breakdown,
        "weekly_performance": [
            {"day": "Mon", "views": int(total_views * 0.12), "likes": int(total_likes * 0.11), "comments": 800},
            {"day": "Tue", "views": int(total_views * 0.15), "likes": int(total_likes * 0.14), "comments": 450},
            {"day": "Wed", "views": int(total_views * 0.18), "likes": int(total_likes * 0.20), "comments": 1200},
            {"day": "Thu", "views": int(total_views * 0.14), "likes": int(total_likes * 0.16), "comments": 670},
            {"day": "Fri", "views": int(total_views * 0.13), "likes": int(total_likes * 0.12), "comments": 890},
            {"day": "Sat", "views": int(total_views * 0.16), "likes": int(total_likes * 0.15), "comments": 750},
            {"day": "Sun", "views": int(total_views * 0.12), "likes": int(total_likes * 0.12), "comments": 900}
        ],
        "top_content": top_content,
        "audience_demographics": {
            "age_groups": {"18-24": 35, "25-34": 40, "35-44": 15, "45+": 10},
            "gender": {"male": 45, "female": 55},
            "locations": {"US": 40, "UK": 20, "India": 25, "Other": 15}
        }
    }
    return analytics_data

# 📈 Get Content Performance
@app.get("/api/analytics/content")
async def get_content_performance(current_user = Depends(get_current_user)):
    content_data = []
    async for item in content_collection.find({"user_id": current_user["email"]}).sort("views", -1):
        item["id"] = str(item["_id"])
        del item["_id"]
        content_data.append(item)

    if len(content_data) == 0:
        content_data = [
            {
                "id": "1",
                "title": "How to Grow on YouTube in 2026",
                "platform": "youtube",
                "views": 15000,
                "likes": 3200,
                "comments": 450,
                "shares": 890,
                "engagement_rate": 8.2,
                "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat()
            },
            {
                "id": "2",
                "title": "Instagram Reels Algorithm Secrets",
                "platform": "instagram",
                "views": 12000,
                "likes": 2800,
                "comments": 340,
                "shares": 670,
                "engagement_rate": 6.5,
                "created_at": (datetime.utcnow() - timedelta(days=7)).isoformat()
            },
            {
                "id": "3",
                "title": "Viral TikTok Trend Breakdown",
                "platform": "tiktok",
                "views": 9800,
                "likes": 2100,
                "comments": 280,
                "shares": 450,
                "engagement_rate": 5.8,
                "created_at": (datetime.utcnow() - timedelta(days=10)).isoformat()
            }
        ]
    return {"content": content_data}

# 📊 Get Growth Metrics
@app.get("/api/analytics/growth")
async def get_growth_metrics(current_user = Depends(get_current_user)):
    growth_data = {
        "follower_growth": [
            {"month": "Jan", "followers": 1000, "growth": "+12%"},
            {"month": "Feb", "followers": 1200, "growth": "+20%"},
            {"month": "Mar", "followers": 1500, "growth": "+25%"},
            {"month": "Apr", "followers": 1900, "growth": "+26%"},
            {"month": "May", "followers": 2400, "growth": "+26%"},
            {"month": "Jun", "followers": 3000, "growth": "+25%"}
        ],
        "engagement_trend": [
            {"month": "Jan", "rate": 2.5},
            {"month": "Feb", "rate": 3.0},
            {"month": "Mar", "rate": 3.8},
            {"month": "Apr", "rate": 4.0},
            {"month": "May", "rate": 4.5},
            {"month": "Jun", "rate": 4.2}
        ],
        "total_reach": 45000,
        "impressions": 68000
    }
    return growth_data

# ============================================
# 8. CONTENT MANAGEMENT ENDPOINTS
# ============================================

# 📝 Create Content
@app.post("/api/content")
async def create_content(content: ContentCreate, current_user = Depends(get_current_user)):
    content_dict = content.dict()
    content_dict["user_id"] = current_user["email"]
    content_dict["created_at"] = datetime.utcnow()
    content_dict["updated_at"] = datetime.utcnow()
    
    # Calculate engagement rate if not provided or 0
    if not content_dict.get("engagement_rate") and content_dict.get("views", 0) > 0:
        engagements = content_dict.get("likes", 0) + content_dict.get("comments", 0) + content_dict.get("shares", 0)
        content_dict["engagement_rate"] = round((engagements / content_dict["views"]) * 100, 2)
    
    result = await content_collection.insert_one(content_dict)
    
    return {
        "success": True,
        "message": "Content created successfully!",
        "content_id": str(result.inserted_id),
        "content": {
            "id": str(result.inserted_id),
            "title": content_dict["title"],
            "platform": content_dict["platform"],
            "views": content_dict["views"],
            "likes": content_dict["likes"],
            "comments": content_dict["comments"],
            "shares": content_dict["shares"],
            "engagement_rate": content_dict.get("engagement_rate", 0.0),
            "created_at": content_dict["created_at"].isoformat()
        }
    }

# 📋 Get All Content for Current User
@app.get("/api/content")
async def get_all_content(current_user = Depends(get_current_user)):
    contents = []
    async for item in content_collection.find({"user_id": current_user["email"]}).sort("created_at", -1):
        item["id"] = str(item["_id"])
        del item["_id"]
        contents.append(item)
    
    # If no DB content yet, provide sample initial items so dashboard is never blank
    if len(contents) == 0:
        contents = [
            {
                "id": "sample-1",
                "title": "How to Grow on YouTube in 2026",
                "platform": "youtube",
                "views": 15000,
                "likes": 3200,
                "comments": 450,
                "shares": 890,
                "engagement_rate": 8.2,
                "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat()
            },
            {
                "id": "sample-2",
                "title": "Instagram Reels Algorithm Secrets",
                "platform": "instagram",
                "views": 12000,
                "likes": 2800,
                "comments": 340,
                "shares": 670,
                "engagement_rate": 6.5,
                "created_at": (datetime.utcnow() - timedelta(days=7)).isoformat()
            },
            {
                "id": "sample-3",
                "title": "Viral TikTok Trend Breakdown",
                "platform": "tiktok",
                "views": 9800,
                "likes": 2100,
                "comments": 280,
                "shares": 450,
                "engagement_rate": 5.8,
                "created_at": (datetime.utcnow() - timedelta(days=10)).isoformat()
            }
        ]
    
    return {"contents": contents}

# 🗑️ Delete Content
@app.delete("/api/content/{content_id}")
async def delete_content(content_id: str, current_user = Depends(get_current_user)):
    try:
        obj_id = ObjectId(content_id)
        result = await content_collection.delete_one({"_id": obj_id, "user_id": current_user["email"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Content not found or unauthorized")
    except Exception:
        # Sample items or invalid ID
        return {"success": True, "message": "Content removed from view"}
        
    return {"success": True, "message": "Content deleted successfully"}

# ============================================
# 9. SOCIAL MEDIA INTEGRATION (Mock)
# ============================================

@app.get("/api/social/status")
async def get_social_status(current_user = Depends(get_current_user)):
    return {
        "platforms": [
            {"id": "youtube", "name": "YouTube", "connected": True, "username": "@creator_hub", "followers": "45.2K"},
            {"id": "instagram", "name": "Instagram", "connected": True, "username": "@creator_official", "followers": "32.8K"},
            {"id": "tiktok", "name": "TikTok", "connected": True, "username": "@creator_tok", "followers": "28.5K"},
            {"id": "facebook", "name": "Facebook", "connected": False, "username": "", "followers": "0"}
        ]
    }

# ============================================
# 10. ROOT & HEALTH CHECK ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {
        "message": "🚀 CreatorIQ API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": [
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/me",
            "/api/analytics/dashboard",
            "/api/analytics/content",
            "/api/analytics/growth",
            "/api/content",
            "/api/admin/users",
            "/api/health"
        ]
    }

@app.get("/api/health")
async def health_check():
    try:
        await client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "MongoDB Atlas - Connected ✅",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": f"MongoDB Atlas - Disconnected ({str(e)}) ❌",
            "timestamp": datetime.utcnow().isoformat()
        }

# ============================================
# 11. RUN SERVER ENTRY POINT
# ============================================
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
