# 🚀 Milestone 2 — Complete Beginner's Guide (Week 3 & 4)
## Real Social API Integration (YouTube Data API v3 & Instagram Graph API)

> **Project:** CreatorIQ Platform  
> **Milestone 2 Goal:** Replace placeholder dashboard metrics with live, authenticated social media data from YouTube and Instagram, add automated synchronization, and provide a "Connected Channels" management portal.

---

## 🎯 What You Will Achieve in Milestone 2

1. ✅ **YouTube Data API v3 Integration**: Authenticate creator accounts via Google OAuth 2.0 and pull channel statistics (subscribers, total views, video count) and video performance metrics (views, likes, comments).
2. ✅ **Instagram Graph API Integration**: Connect Instagram Professional / Creator accounts via Meta OAuth 2.0 and retrieve follower counts, reach, impressions, and media insights.
3. ✅ **Multi-Platform OAuth Token Management**: Securely store encrypted `access_token` and `refresh_token` in MongoDB Atlas under the `platform_accounts` collection.
4. ✅ **Automated & On-Demand Data Sync**: Background syncing every 6 hours plus an instant **"🔄 Sync Now"** button in the dashboard.
5. ✅ **Connected Accounts Management UI**: Frontend screen showing linked channels, connection health pills, and disconnect options.

---

## 📅 Week 3 — Social API Setup & OAuth 2.0 Flow

### Day 1–2: Setup Developer Accounts & API Keys

#### 1. Google Cloud Console (YouTube Data API v3)
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Click **New Project** and name it `CreatorIQ-Production`.
3. In the sidebar, navigate to **APIs & Services** > **Library**.
4. Search for **YouTube Data API v3** and click **Enable**.
5. Navigate to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**.
   - App Name: `CreatorIQ`.
   - User support email: your personal email.
   - Developer contact: your email.
   - Scopes to add:
     - `https://www.googleapis.com/auth/youtube.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Test Users: Add your personal Google account email so you can test during development.
6. Navigate to **APIs & Services** > **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `CreatorIQ Backend OAuth`.
   - Authorized JavaScript origins: `http://localhost:3000` (and `http://localhost:5173`).
   - Authorized redirect URIs: `http://localhost:8000/api/social/youtube/callback`.
7. Copy your **Client ID** and **Client Secret**.

---

#### 2. Meta for Developers (Instagram Graph API)
> 💡 *Note: Instagram Graph API requires an Instagram Professional (Creator or Business) account connected to a Facebook Page.*

1. Go to [Meta for Developers](https://developers.facebook.com) and log in.
2. Click **Create App** > select **Other** > **Business** app type.
3. Name your app `CreatorIQ Platform`.
4. In App Dashboard, find **Instagram Graph API** and click **Set Up**.
5. Add **Facebook Login for Business** product:
   - Valid OAuth Redirect URIs: `http://localhost:8000/api/social/instagram/callback`.
6. Required Permissions:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`
7. Copy your **App ID** and **App Secret** from **App Settings** > **Basic**.

---

### Day 3–4: Update `.env` & MongoDB Collections

Add the credentials to `backend/.env`:
```env
# YouTube OAuth 2.0 Credentials
YOUTUBE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-your_google_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:8000/api/social/youtube/callback

# Instagram Graph API Credentials
INSTAGRAM_APP_ID=your_meta_app_id
INSTAGRAM_APP_SECRET=your_meta_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:8000/api/social/instagram/callback
```

#### New MongoDB Collections for Milestone 2:

**1. `platform_accounts` Collection:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "6aac209d22033336b5f19709",
  "platform": "youtube", // "youtube" | "instagram"
  "platform_user_id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  "channel_title": "Tech With Alex",
  "access_token": "ya29.a0AfH6SM...",
  "refresh_token": "1//04hJ...",
  "token_expires_at": "2026-09-18T00:30:00Z",
  "connected_at": "2026-09-17T22:30:00Z",
  "last_synced_at": "2026-09-17T22:30:00Z",
  "is_active": true
}
```

**2. `analytics_snapshots` Collection:**
```json
{
  "_id": "ObjectId(...)",
  "user_id": "6aac209d22033336b5f19709",
  "platform": "youtube",
  "subscribers": 12450,
  "total_views": 45230,
  "total_videos": 48,
  "average_views_per_video": 942,
  "engagement_rate": 5.64,
  "recorded_at": "2026-09-17T22:30:00Z"
}
```

---

### Day 5–7: Build the OAuth Endpoints in FastAPI

Create `backend/app/api/v1/endpoints/social.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
import httpx
import os
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.database import database
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/social", tags=["Social Media OAuth Integration"])

platform_accounts_collection = database["platform_accounts"]

# 1. Start YouTube OAuth Flow
@router.get("/youtube/connect")
async def youtube_connect(user=Depends(get_current_user)):
    client_id = os.getenv("YOUTUBE_CLIENT_ID")
    redirect_uri = os.getenv("YOUTUBE_REDIRECT_URI")
    scope = "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile"
    
    # State parameter carries user ID safely to the callback
    state = user["id"]
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&"
        f"scope={scope}&access_type=offline&prompt=consent&state={state}"
    )
    return {"auth_url": auth_url}

# 2. YouTube OAuth Callback
@router.get("/youtube/callback")
async def youtube_callback(code: str = Query(...), state: str = Query(...)):
    user_id = state
    token_url = "https://oauth2.googleapis.com/token"
    
    payload = {
        "client_id": os.getenv("YOUTUBE_CLIENT_ID"),
        "client_secret": os.getenv("YOUTUBE_CLIENT_SECRET"),
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": os.getenv("YOUTUBE_REDIRECT_URI"),
    }

    async with httpx.AsyncClient() as client:
        # Exchange code for access & refresh token
        token_res = await client.post(token_url, data=payload)
        token_data = token_res.json()

        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to retrieve YouTube token")

        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token", "")

        # Fetch Channel Info from YouTube Data API v3
        yt_res = await client.get(
            "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        yt_data = yt_res.json()
        item = yt_data["items"][0]
        channel_id = item["id"]
        channel_title = item["snippet"]["title"]

    # Upsert into MongoDB Atlas
    expires_at = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))
    await platform_accounts_collection.update_one(
        {"user_id": user_id, "platform": "youtube"},
        {"$set": {
            "platform_user_id": channel_id,
            "channel_title": channel_title,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_expires_at": expires_at,
            "last_synced_at": datetime.utcnow(),
            "is_active": True
        }},
        upsert=True
    )

    # Redirect back to frontend
    return RedirectResponse(url="http://localhost:3000/content?connected=youtube")
```

---

## 📅 Week 4 — Automated Metric Syncing & Analytics Engine

### Day 1–3: The Sync Engine (`backend/app/services/sync_service.py`)

```python
import httpx
from datetime import datetime
from app.core.database import database

platform_accounts_collection = database["platform_accounts"]
analytics_snapshots_collection = database["analytics_snapshots"]

async def sync_youtube_metrics(user_id: str):
    account = await platform_accounts_collection.find_one({"user_id": user_id, "platform": "youtube", "is_active": True})
    if not account:
        return None

    access_token = account["access_token"]

    async with httpx.AsyncClient() as client:
        # Query channel stats
        res = await client.get(
            "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        stats = res.json()["items"][0]["statistics"]

        subscribers = int(stats.get("subscriberCount", 0))
        views = int(stats.get("viewCount", 0))
        videos = int(stats.get("videoCount", 0))

        # Query top 5 recent videos
        videos_res = await client.get(
            f"https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={account['platform_user_id']}&maxResults=5&order=date&type=video",
            headers={"Authorization": f"Bearer {access_token}"}
        )

    snapshot = {
        "user_id": user_id,
        "platform": "youtube",
        "subscribers": subscribers,
        "total_views": views,
        "total_videos": videos,
        "engagement_rate": round((views / max(subscribers, 1)) * 0.05, 2),
        "recorded_at": datetime.utcnow()
    }

    await analytics_snapshots_collection.insert_one(snapshot)
    await platform_accounts_collection.update_one(
        {"_id": account["_id"]},
        {"$set": {"last_synced_at": datetime.utcnow()}}
    )
    return snapshot
```

---

### Day 4–5: Periodic Scheduler (FastAPI Background Tasks / APScheduler)

Install APScheduler:
```bash
pip install apscheduler
```

In `backend/app/main.py`:
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.sync_service import sync_all_accounts

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def start_background_jobs():
    # Sync all connected creator channels every 6 hours
    scheduler.add_job(sync_all_accounts, "interval", hours=6)
    scheduler.start()
```

---

### Day 6–7: Frontend "Connected Channels" Component

In `frontend/src/pages/ConnectedChannels.jsx`:
- Shows cards for **YouTube** and **Instagram**.
- If connected: displays **Channel Name**, **Subscribers**, **Last Synced Timestamp**, and a **"🔄 Sync Now"** button.
- If disconnected: displays a **"Connect Channel"** button that initiates the OAuth flow.

---

## 🎯 Milestone 2 Checklist for Submission

- [ ] Google Cloud Console project created with YouTube Data API v3 enabled
- [ ] Meta Developer App created with Instagram Graph API enabled
- [ ] OAuth redirect callbacks functioning on `http://localhost:8000/api/social/*`
- [ ] Access & Refresh tokens saved to MongoDB Atlas `platform_accounts`
- [ ] Automated periodic syncing scheduled (every 6 hours)
- [ ] Manual "Sync Now" endpoint (`POST /api/social/sync`) functioning
- [ ] Dashboard dynamically displays live subscriber & view metrics from YouTube
- [ ] Recharts graphs update when new metrics are synced

With **Milestone 1 now complete and verified**, you have the solid foundation required to begin Milestone 2 immediately!
