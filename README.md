# 📊 CreatorIQ — Multi-Platform Creator Analytics Platform

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**A 3-tier, production-grade analytics platform aggregating multi-platform creator performance, audience demographics, monetization streams, and administrative governance.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start-guide) • [Demo Accounts](#-demo-accounts) • [API Endpoints](#-api-endpoints-reference) • [Testing](#-automated-test-suites)

</div>

---

## 🌟 Key Features

- 📊 **Unified Creator Dashboard**:
  - **4 Dynamic KPI Cards**: Total Views, Total Likes, Consolidated Reach/Followers, and Calculated Engagement Rate.
  - **Interactive Recharts**: 7-day Views vs. Likes Bar Chart, Platform Audience Share Donut Chart, and Monotonic Growth Trajectory Area Chart.
  - **Real-time Channel Toggles**: 1-click connect/disconnect for **YouTube, Instagram, Facebook, and X (Twitter)** with instant metric synchronization.
  - **Ranked Top Content Table**: Multi-platform content sorted by engagement and reach.

- 👥 **Audience Demographics (`/audience`)**:
  - Aggregated Age Distribution (`18-24`, `25-34`, `35-44`, `45+`).
  - Gender Split, Top Geographic Regions (US, UK, India, Germany, etc.), and Device Usage (Mobile, Desktop, Tablet, TV).

- 💰 **Consolidated Monetization & Revenue (`/revenue`)**:
  - Combined USD revenue streams (YouTube AdSense, Instagram Brand Deals, Facebook Stars, X Subscriptions).
  - Per-platform breakdown cards and stream telemetry.

- 📝 **Content Management Hub (`/content`)**:
  - **Live Provider Feed**: Browse live content retrieved dynamically from connected mock platforms.
  - **Custom Creator Posts**: Publish custom posts directly into MongoDB Atlas with automatic engagement rate calculation and delete functionality.

- 📄 **Audit Reports & CSV Export (`/reports`)**:
  - One-click export of consolidated creator performance to audit-ready CSV.

- 🛡️ **Administrator Governance Control Center (`/admin`)**:
  - **Platform Overview**: Global user counts, total content, connection volumes, and system-wide telemetry.
  - **User Directory**: List all users, create accounts, toggle user roles (`creator` ↔ `admin`), and delete accounts with self-deletion guards.
  - **System Health Diagnostics**: Real-time simultaneous latency pings for Backend (port 8000), MongoDB Atlas, and Mock Social API (port 9000).
  - **Activity Log**: Chronological audit trail of user registrations and administrative actions.
  - **Content Moderation**: Global content feed across all users.

- 🔐 **Enterprise-Grade Security & RBAC**:
  - JWT Access Tokens (HS256) with BCrypt password hashing.
  - Server-enforced Role-Based Access Control (`require_role`) and client-side `<ProtectedRoute>`.
  - Live MongoDB Atlas health indicator pill in top navigation.

---

## 🏗️ System Architecture

CreatorIQ follows the **Backend For Frontend (BFF)** pattern across 3 decoupled tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                       │
│             http://localhost:3000 (or :5173)                │
│  - Role-Aware Routing (Creator vs Admin Views)              │
│  - Recharts Visualizations & Tailwind CSS                   │
│  - JWT Bearer Interceptors & Live DB Status Pill            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FastAPI Backend Service                     │
│                  http://localhost:8000                      │
│  - Authentication & JWT Token Issuer (BCrypt)               │
│  - Role-Based Access Control (Creator / Admin)              │
│  - Cross-Platform Forward-Fill Aggregator                   │
│  - MongoDB Atlas Motor Client (Async CRUD)                  │
└───────────────┬──────────────────────────────┬──────────────┘
                │                              │
                │ Async Driver                 │ HTTP Requests (Async httpx)
                ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│     MongoDB Atlas Cloud      │ │    Mock Social Media API    │
│  - users collection          │ │    http://localhost:9000    │
│  - content collection        │ │  - YouTube, IG, FB, X       │
│  - analytics collection      │ │  - Persistent Channel State │
│  - platform_accounts         │ │  - Realistic Creator Data   │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```
infosis-project/
├── backend/                    # FastAPI Backend Application
│   ├── app/
│   │   ├── api/                # API Endpoints (auth, analytics, content, admin, social)
│   │   ├── core/               # Database connection (Motor), security (BCrypt/JWT), config
│   │   ├── db/                 # Init DB & Demo user seeders
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Social service proxy & mock client
│   │   └── utils/              # Dependencies & RBAC auth guards
│   ├── main.py                 # Backend entry point (Port 8000)
│   ├── verify_backend.py       # Automated backend integration test
│   ├── requirements.txt        # Backend dependencies
│   └── run.bat                 # Windows launch script
│
├── mock-api/                   # Standalone Mock Social Media Provider API
│   ├── app/
│   │   ├── data/               # JSON datasets (youtube, instagram, facebook, x)
│   │   ├── routes/             # Provider-specific routes (/mock/{platform}/...)
│   │   ├── data_loader.py      # Cached JSON fixture loader
│   │   └── state.py            # Channel connection state manager
│   ├── main.py                 # Mock API entry point (Port 9000)
│   ├── requirements.txt        # Mock API dependencies
│   └── run.bat                 # Windows launch script
│
├── frontend/                   # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── api/                # Axios client with JWT interceptor
│   │   ├── components/         # Shared UI (Sidebar, Navbar, KpiCard, ProtectedRoute)
│   │   ├── context/            # AuthContext (login, register, logout, session restore)
│   │   ├── pages/              # Creator pages (Dashboard, Channels, Content, Audience, etc.)
│   │   └── pages/admin/        # Admin pages (PlatformOverview, UserManagement, SystemHealth)
│   ├── index.html              # HTML entry with Inter font
│   ├── package.json            # Frontend npm dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite build & proxy settings
│
├── docs/                       # Project Documentation & Guides
│   ├── DEPLOYMENT_GUIDE.md     # Step-by-step Render & Vercel deployment guide
│   └── PORTFOLIO_CASE_STUDY.md # Professional case study & resume bullets
│
├── requirements.txt            # Root project dependencies
├── seed_demo_users.py          # MongoDB demo account seeder
├── test_milestone2.py          # Full integration test suite (27 checks)
├── test_dashboard_alignment.py # Monotonicity & KPI verification test
└── render.yaml                 # Render cloud deployment blueprint
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- MongoDB Atlas cluster URL (already pre-configured in `.env`)

---

### Step 1: Start the Mock Social API (Port 9000)

```bash
cd mock-api
pip install -r requirements.txt
python main.py
```
> 🌐 Runs at: `http://localhost:9000`  
> 📚 Swagger Docs: `http://localhost:9000/docs`

---

### Step 2: Start the Backend API (Port 8000)

Open a second terminal:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
> 🚀 Runs at: `http://localhost:8000`  
> 📚 Swagger Docs: `http://localhost:8000/docs`  
> 🩺 DB Health Check: `http://localhost:8000/api/health`

---

### Step 3: Start the Frontend (Port 3000 / 5173)

Open a third terminal:
```bash
cd frontend
npm install
npm run dev
```
> ⚛️ Access Application at: `http://localhost:3000` (or `http://localhost:5173`)

---

## 🔑 Demo Accounts

Use the **1-Click Quick Demo Login** buttons on the login screen or enter the credentials below:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Creator** | `alex.creator@creatoriq.com` | `password123` | Multi-channel dashboard, audience demographics, custom content CRUD, CSV reports |
| **Creator (Alt)** | `creator@creatoriq.com` | `demo1234` | Alternative pre-seeded creator demo account |
| **Admin** | `admin@creatoriq.com` | `adminpass123` | Platform overview, user role management, system health, content moderation |
| **Admin (Alt)** | `admin@test.com` | `adminpassword123` | Alternative pre-seeded administrator demo account |

---

## 📡 API Endpoints Reference

### Public & Health
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | API status & endpoint discovery | Public |
| `GET` | `/api/health` | MongoDB Atlas ping & connectivity status | Public |

### Authentication & Profile
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account (`creator` or `admin`) | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive Bearer JWT token | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Bearer Token |
| `PUT` | `/api/auth/me` | Update name, bio, and social handles in MongoDB | Bearer Token |

### Creator Analytics & Social Providers
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard/summary` | Consolidated dashboard KPIs, charts & top content | Creator Token |
| `GET` | `/api/analytics/multi-platform` | Cross-platform follower, view, like & revenue summary | Creator Token |
| `GET` | `/api/analytics/audience-merged` | Consolidated audience age, gender, country & device data | Creator Token |
| `GET` | `/api/analytics/trends` | Monotonic forward-fill follower & view trajectory | Creator Token |
| `GET` | `/api/social/connections` | List connected & disconnected social platforms | Creator Token |
| `POST` | `/api/social/{platform}/connect` | Connect a social provider channel (e.g. `youtube`) | Creator Token |
| `POST` | `/api/social/{platform}/disconnect`| Disconnect a provider channel (enforces 403) | Creator Token |

### Content Management
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/content/` | Retrieve user's custom published posts | Creator Token |
| `POST` | `/api/content/` | Publish new post with auto engagement calculation | Creator Token |
| `DELETE`| `/api/content/{id}` | Delete custom post from MongoDB Atlas | Creator Token |

### Administrator Governance
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Platform metrics (user counts, roles, content total) | Admin Token |
| `GET` | `/api/admin/users` | List all registered accounts with connection count | Admin Token |
| `POST` | `/api/admin/users` | Create new account directly from admin panel | Admin Token |
| `PUT` | `/api/admin/users/{id}/role` | Update user role (`creator` ↔ `admin`) | Admin Token |
| `DELETE`| `/api/admin/users/{id}` | Delete user account (with self-deletion guard) | Admin Token |
| `GET` | `/api/admin/system-health` | Live latency check for Backend, DB & Mock API | Admin Token |
| `GET` | `/api/admin/activity` | Audit log of platform user events | Admin Token |
| `GET` | `/api/admin/content` | Global content feed for moderation | Admin Token |

---

## 🧪 Automated Test Suites

The repository contains 3 automated test suites verifying all layers:

```bash
# 1. Full Integration Test Suite (27 checks covering auth, mock-api, RBAC, demographics)
python test_milestone2.py
# Output: PASSED: 27   FAILED: 0

# 2. Monotonicity & Forward-Fill KPI Alignment Test
python test_dashboard_alignment.py
# Output: ALL DASHBOARD ALIGNMENT CHECKS PASSED!

# 3. Backend End-to-End Test Suite (Health, Auth, Profile, CRUD, Admin guards)
cd backend && python verify_backend.py
# Output: ALL 12 VERIFICATION CHECKS PASSED PERFECTLY!
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
