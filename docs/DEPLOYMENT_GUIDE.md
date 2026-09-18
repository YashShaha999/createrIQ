# 🚀 CreatorIQ — Production Deployment Guide (Render + Vercel)

This guide walks you through deploying **CreatorIQ** to the cloud:
1. **Database**: MongoDB Atlas (Cloud Database)
2. **Mock Social API**: Render (Python Web Service)
3. **Backend API**: Render (Python Web Service)
4. **Frontend UI**: Vercel (React + Vite Single Page Application)

---

## 🍃 1. MongoDB Atlas Configuration

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access** under Security:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so that cloud platforms like Render can connect without static IP restrictions.
3. Go to **Database Access**:
   - Ensure you have a user with `Read and write to any database` privilege.
4. Obtain your connection string:
   - Click **Connect** → **Drivers** (Python 3.12+).
   - Format:
     ```
     mongodb+srv://<username>:<password>@cluster0.xswno2v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```

---

## 🌐 2. Deploy Mock Social API on Render

Since the Mock API provides the data for YouTube, Instagram, Facebook, and X, deploy it first.

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `YashShaha999/createrIQ`.
4. Configure the Web Service settings:
   - **Name**: `creatoriq-mock-api`
   - **Region**: Select your preferred region (e.g., Oregon / Singapore / Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `mock-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Environment Variables:
   - `PORT`: `9000` (Render dynamically injects `$PORT`, but setting it ensures default compatibility).
   - `PYTHON_VERSION`: `3.11.8`
6. Click **Create Web Service**.
7. Once deployed, note down your Mock API URL, e.g.:
   ```
   https://creatoriq-mock-api.onrender.com
   ```
   Test in your browser: `https://creatoriq-mock-api.onrender.com/` → should return `{"service": "CreatorIQ Mock Social API"}`.

---

## ⚡ 3. Deploy Backend API on Render

1. On [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2. Connect your GitHub repository: `YashShaha999/createrIQ`.
3. Configure the Web Service settings:
   - **Name**: `creatoriq-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables**:

   | Key | Value | Description |
   |---|---|---|
   | `PYTHON_VERSION` | `3.11.8` | Recommended Python version |
   | `MONGO_URL` | `mongodb+srv://<user>:<password>@cluster0...` | MongoDB connection URI |
   | `DATABASE_NAME` | `creatoriq_db` | MongoDB Database Name |
   | `SECRET_KEY` | `your-secure-production-jwt-secret-key-2026` | Key used to sign JWT tokens |
   | `MOCK_API_URL` | `https://creatoriq-mock-api.onrender.com` | URL of the Mock API from Step 2 |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiration (24 hours) |

5. Click **Create Web Service**.
6. Once deployed, verify your Backend URL:
   ```
   https://creatoriq-backend.onrender.com/api/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "mongodb": "connected"
   }
   ```

---

## ⚛️ 4. Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository: `YashShaha999/createrIQ`.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://creatoriq-backend.onrender.com` *(your live Render backend URL from Step 3 without trailing slash)*.
6. Click **Deploy**.
7. Vercel will build and assign you a live domain, e.g.:
   ```
   https://creatoriq.vercel.app
   ```

---

## 🔒 5. Post-Deployment Verification & CORS Alignment

1. **Update Backend CORS**:
   In `backend/app/main.py`, verify that `allow_origins` includes your live Vercel domain or `*`:
   ```python
   allow_origins=[
       "http://localhost:3000",
       "http://localhost:5173",
       "https://creatoriq.vercel.app",
       "*"
   ]
   ```
   *(With `"*"`, any domain can communicate with the API).*

2. **Live Test Flow**:
   - Open your Vercel URL in an incognito window.
   - Click **Demo Creator** → verifies Auth & JWT issuance from Render.
   - Inspect the top bar: verify **MongoDB Atlas: Connected ✅**.
   - Navigate to **Channels** → connect/disconnect platforms → verifies Mock API proxying.
   - Navigate to **Audience** & **Revenue** → verifies cross-platform analytics aggregation.
   - Navigate to **Content** → publish a post → verifies write operations to MongoDB Atlas.
   - Log out and log in with **Demo Admin** → verifies Role-Based Access Control and System Health diagnostics.

---

## 🛠️ Troubleshooting

- **Cold Starts on Render Free Tier**:
  Free tier instances spin down after 15 minutes of inactivity. When accessed again, the first request may take ~30-45 seconds to wake up.
- **MongoDB Connection Timeout**:
  Confirm that `0.0.0.0/0` is active in MongoDB Atlas Network Access.
- **401 Unauthorized Errors**:
  Clear browser `localStorage` to clear any old or expired tokens generated with previous secret keys.
