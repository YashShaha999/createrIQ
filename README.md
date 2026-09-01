# 📊 CreatorIQ - Complete Milestone 1: Creator & Analytics Dashboard

Welcome to **CreatorIQ**, a next-generation Creator & Influencer Management and Performance Analytics Dashboard. This project fulfills all requirements for **Milestone 1 (Week 1-2)** with full-stack FastAPI + MongoDB Atlas cloud database backend and React (Vite) + Recharts frontend.

---

## 🌟 Milestone 1 Features & Capabilities

- 📊 **Dynamic Analytics Dashboard**:
  - **4 KPI Metric Cards**: Total Views, Total Likes, Engagement Rate %, and Total Followers / Reach with month-over-month growth trends.
  - **Weekly Performance (Bar Chart)**: Daily comparison of views vs. likes across the week.
  - **Platform Distribution (Pie / Donut Chart)**: Audience and viewer share breakdown across YouTube, Instagram, TikTok, and Facebook.
  - **6-Month Follower Growth (Area Chart)**: Smooth trajectory curves illustrating audience expansion over time.
  - **Audience Demographics**: Age distribution (18-24, 25-34, 35-44, 45+), Gender split, and Top Geographic locations (US, UK, India, etc.).
  - **Top Performing Content Table**: Ranked videos/posts with views, likes, shares, and engagement rates.
  - **Social Media Status Widget**: Real-time connected channels (YouTube, Instagram, TikTok, Facebook).

- 📈 **In-Depth Growth Analytics (`/analytics`)**:
  - Detailed engagement trend line charts, total impressions, unique reach, and conversion analytics.

- 📝 **Content Management Hub (`/content`)**:
  - **Publish Content Modal**: Create new posts with Title, Platform, Views, Likes, Comments, Shares, with automatic calculation of Engagement Rate (`(likes + comments + shares) / views * 100`).
  - Search & Platform Filters (YouTube, Instagram, TikTok, Facebook).
  - Delete content with instant database synchronization.

- 👤 **Creator Profile & Management (`/profile`)**:
  - Profile header with customizable avatar, bio, join date, and social channels.
  - In-place profile editing with instant MongoDB persistence.

- ⚙️ **Admin Control Panel (`/admin`)**:
  - Dedicated administrative dashboard accessible to `admin` accounts.
  - Total platform metrics, registered user breakdown by role (Creator / Admin), and user search.

- 🔑 **Authentication & Security**:
  - JWT Bearer token authentication with bcrypt password encryption.
  - Role-Based Access Control (Creator and Admin).
  - 1-Click Quick Demo Login buttons for instant project evaluation and grading presentations.
  - Live MongoDB Atlas health indicator pill (`Database: Connected ✅`).

---

## 📁 Complete Project Architecture

```
creatoriq/
├── backend/
│   ├── main.py                # Complete FastAPI application (Auth, Analytics, Content, Admin, MongoDB Atlas)
│   ├── requirements.txt       # Python dependencies (FastAPI, Uvicorn, Motor, PyMongo, Jose, Passlib)
│   ├── verify_backend.py      # Automated backend testing script
│   └── .env.example           # Environment configuration template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Clean Sidebar & Topbar with live DB health indicator
│   │   │   ├── Dashboard.jsx  # Interactive Analytics Dashboard with KPIs & Recharts
│   │   │   ├── Analytics.jsx  # In-depth Growth & Engagement metrics page
│   │   │   ├── Content.jsx    # Content creation, library, and filtering module
│   │   │   ├── Profile.jsx    # Profile view & edit with embedded admin table
│   │   │   ├── AdminPanel.jsx # Dedicated Administrator Control Center
│   │   │   ├── Login.jsx      # Login with 1-click Demo Fill shortcuts
│   │   │   └── Register.jsx   # Role registration (Creator / Admin)
│   │   ├── api.js             # Axios client with JWT request/response interceptors
│   │   ├── App.jsx            # React Router setup & ProtectedRoute guards
│   │   ├── main.jsx           # React DOM root entry point
│   │   └── index.css          # Clean student project design system & responsive styling
│   ├── index.html             # HTML5 template with Inter font
│   ├── package.json           # Dependencies (React 18, React Router, Recharts, Lucide Icons, Axios)
│   └── vite.config.js         # Vite configuration
│
└── README.md
```

---

## 🚀 Step-by-Step Run Instructions

### 1️⃣ Step 1: Start Backend (FastAPI + MongoDB Atlas)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   python main.py
   ```
   > 🚀 Backend runs at: `http://localhost:8000`  
   > 📚 Interactive API Docs (Swagger UI): `http://localhost:8000/docs`  
   > 🔍 Health Check: `http://localhost:8000/api/health`

---

### 2️⃣ Step 2: Start Frontend (React + Vite)

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```
   > ⚛️ Frontend runs at: `http://localhost:3000` (or `http://localhost:5173`)

---

### 3️⃣ Step 3: Access & Test the App

1. Open `http://localhost:3000` in your web browser.
2. Click **"Demo Creator"** on the Login page for 1-click instant login, or create a new account via the **Register** tab.
3. Explore the interactive **Dashboard**, test publishing posts in **Content**, inspect **Analytics**, and manage your **Profile**.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | API Root & Endpoint Index | Public |
| `GET` | `/api/health` | MongoDB Atlas Ping & Health Status | Public |
| `POST` | `/api/auth/register` | Register user (`creator`, `admin`) | Public |
| `POST` | `/api/auth/login` | Authenticate user and obtain Bearer JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & social links | Bearer Token |
| `PUT` | `/api/auth/me` | Update profile information (name, bio, avatar) | Bearer Token |
| `GET` | `/api/analytics/dashboard`| Aggregate dashboard metrics, KPIs & charts | Bearer Token |
| `GET` | `/api/analytics/growth` | Follower trajectory and engagement trends | Bearer Token |
| `GET` | `/api/content` | List published posts for the logged-in user | Bearer Token |
| `POST` | `/api/content` | Create & publish new content post | Bearer Token |
| `DELETE`| `/api/content/{id}` | Delete content post | Bearer Token |
| `GET` | `/api/social/status` | List connected social media channels | Bearer Token |
| `GET` | `/api/admin/users` | List all registered accounts (Admin only) | Admin Token |

---

## ✅ Milestone 1 Complete Checklist

| Feature | Status |
|---|---|
| Project Initialization & Vite + FastAPI Setup | ✅ Complete |
| Database Design & Connection (MongoDB Atlas) | ✅ Complete |
| User Registration with Role Selection | ✅ Complete |
| User Login with JWT Token Storage | ✅ Complete |
| Role-Based Access Control (Creator and Admin) | ✅ Complete |
| Profile Management (View / In-place Edit / Avatar) | ✅ Complete |
| Responsive Layout (Sidebar + Topbar + Mobile Menu) | ✅ Complete |
| 4 Dynamic KPI Metric Cards with Growth Badges | ✅ Complete |
| Interactive Charts (Weekly Bar, Platform Pie, Growth Area) | ✅ Complete |
| Audience Demographics (Age, Gender, Locations) | ✅ Complete |
| Content Library (CRUD, Search, Platform Filters) | ✅ Complete |
| Social Channel Status Integration | ✅ Complete |
| Administrator Control Panel & Directory | ✅ Complete |
| 1-Click Quick Demo Login Shortcuts | ✅ Complete |
| Live MongoDB Atlas Status Health Check | ✅ Complete |
