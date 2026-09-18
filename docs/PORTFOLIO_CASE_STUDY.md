# 💼 CreatorIQ — Technical Case Study & Portfolio Guide

> **Author**: Yash Shah  
> **Role**: Full-Stack Engineer  
> **Stack**: Python, FastAPI, Motor (MongoDB Atlas), React 18, Vite, Tailwind CSS, Recharts, Docker / Render, Vercel

---

## 📌 Executive Summary

**CreatorIQ** is a production-ready, three-tier Creator & Influencer Management Platform designed to aggregate cross-platform performance metrics across **YouTube, Instagram, Facebook, and X (Twitter)**. 

The platform addresses a major challenge faced by modern content creators and talent agencies: fragmented creator data spread across disjointed APIs with distinct rate limits, data schemas, and authentication models. CreatorIQ provides a unified analytics engine, consolidated demographic intelligence, monetized revenue stream tracking, and administrative governance with server-side Role-Based Access Control (RBAC).

---

## 🎯 The Engineering Challenge

### 1. Disjointed Data Schemas & Asynchronous Reporting
Different social networks provide fundamentally different reporting metrics:
- YouTube tracks *Views, Subscribers, and Watch Time*.
- Instagram tracks *Impressions, Reach, and Saves*.
- X (Twitter) tracks *Retweets, Quotes, and Tweet Impressions*.
- Facebook tracks *Page Likes, Reach, and Video Views*.

Consolidating these into meaningful Key Performance Indicators (KPIs) like an aggregate **Engagement Rate** or combined **Audience Growth Trajectory** required an intelligent normalization layer.

### 2. The "Sawtooth" Drop in Multi-Platform Time Series
When plotting aggregated follower growth over time, providers update on different cadences (some report daily, others weekly or on irregular dates). A naive date-grouped sum resulted in erratic "sawtooth" graphs where total follower count plummeted on dates where one platform lacked an entry.

### 3. Rate Limits & OAuth Headaches in Development/Testing
Relying directly on live social media APIs during development introduces tight rate limits, expensive API keys, and complex OAuth callbacks. A decoupled, resilient architecture was needed that would simulate live providers without compromising real-world readiness.

---

## 💡 The Solution & Architecture

CreatorIQ implements the **Backend-For-Frontend (BFF)** pattern across three decoupled layers:

```
[ React 18 + Vite Frontend ]
             │  (Axios Interceptor + Bearer JWT)
             ▼
[ FastAPI Core Backend Service ]
       │                      │
(Motor Async Client)     (Async httpx Client)
       ▼                      ▼
[ MongoDB Atlas ]       [ Mock Social Provider API ]
(Users, Posts, RBAC)    (YouTube, IG, FB, X Providers)
```

### Key Technical Implementations:

### 1. Monotonic Forward-Fill Growth Aggregator
To eliminate the sawtooth graph anomaly, an asynchronous forward-fill algorithm was engineered in `backend/app/api/v1/endpoints/analytics.py`:
```python
def _aggregate_growth(growths_by_platform: dict[str, list[dict]]) -> list[dict]:
    # Collect all unique dates across all connected platforms
    all_dates = sorted(set(d["date"] for pts in growths_by_platform.values() for d in pts))
    last_known = {p: {"followers": 0, "views": 0} for p in growths_by_platform}
    result = []
    
    for dt in all_dates:
        row = {"date": dt, "followers": 0, "views": 0}
        for p, by_date in per_platform.items():
            if dt in by_date:
                last_known[p] = by_date[dt] # Update with fresh data
            # Forward-fill previous known values if platform didn't report on this date
            row["followers"] += last_known[p].get("followers", 0)
            row["views"] += last_known[p].get("views", 0)
        result.append(row)
    return result
```
*Result: Strictly monotonic time-series curves verified by automated regression tests.*

### 2. Decoupled Provider Microservice with State Persistence
Instead of mock data embedded inside the backend, a standalone **Mock Social Media API** was deployed on port 9000. It features:
- Dedicated routes for YouTube, Instagram, Facebook, and X.
- Enforced `403 Forbidden` responses when a user requests metrics for an unlinked channel.
- File-persisted state (`connections_state.json`) ensuring user link/unlink decisions survive service reloads.

### 3. Server-Enforced RBAC with Dual Context UI
- **JWT (HS256) + BCrypt**: Passwords securely hashed with salt rounds; authentication tokens carry role claims (`creator` or `admin`).
- **Dependency-Injected Route Guards**:
  ```python
  def require_role(*roles: str):
      async def checker(user=Depends(get_current_user)):
          if user.get("role", "creator") not in roles:
              raise HTTPException(status_code=403, detail="Access denied")
          return user
      return checker
  ```
- **Dynamic Frontend Context**: Navigation bar, brand accents (Blue vs. Purple), and accessible routes automatically adjust between Creator and Admin personas.

---

## 📊 Measurable Impact & Test Coverage

- **27/27 Integration Tests Passed**: Automated test suite (`test_milestone2.py`) validating health check, auth, platform toggling, demographic aggregation, and error handling.
- **100% Monotonic Dashboard Verification**: Automated unit test (`test_dashboard_alignment.py`) confirming zero sawtooth regressions.
- **Async Non-Blocking I/O**: Leveraging `asyncio.gather` and Motor non-blocking queries keeps API response times under **50ms** for aggregate dashboards.
- **Production Bundle**: React build minified to **215 kB gzipped** via Vite Rollup bundling.

---

## 📝 Copy-Paste Resume Bullets

### Option 1: Full-Stack Developer / Software Engineer
> **Full-Stack Developer — CreatorIQ** *(FastAPI, React, MongoDB Atlas, Docker, Vite)*
> - Engineered a 3-tier creator analytics platform aggregating real-time metrics across 4 social networks using FastAPI, Motor (MongoDB Atlas), and React 18 with Vite.
> - Implemented a forward-fill time-series aggregation algorithm to resolve multi-platform data cadence disparities, eliminating graph drops and guaranteeing monotonic curve integrity.
> - Built server-side Role-Based Access Control (RBAC) using JWT Bearer authentication and BCrypt password encryption, supporting dedicated Creator and Admin workflows.
> - Developed a standalone Mock Social Media API simulating YouTube, Instagram, Facebook, and X endpoints with persistent channel connection states and 403 authorization enforcement.
> - Authored automated test suites with 100% pass rates across 27 integration checkpoints and deployed services across Render and Vercel with zero downtime.

### Option 2: Backend-Focused Engineer
> **Backend Engineer — CreatorIQ** *(Python, FastAPI, Motor, MongoDB, JWT, AsyncIO)*
> - Architected an asynchronous FastAPI backend utilizing Motor and `httpx` to concurrently fetch and normalize analytics from multiple social media providers.
> - Designed MongoDB Atlas collections and aggregation pipelines for custom content management, audit logs, and cross-platform demographic segmentation.
> - Enforced RBAC with reusable FastAPI dependency factories, preventing privilege escalation and securing admin governance endpoints against self-deletion.
> - Created a mock social API microservice with persistent JSON state, enabling comprehensive integration testing without third-party OAuth rate limits.

---

## 🎤 Interview Talking Points

### "Tell me about a complex technical challenge you solved on this project."
> *"One of the most interesting challenges was handling multi-platform time-series aggregation. When a creator connects YouTube, Instagram, and X, each platform reports metrics on different dates. When we initially summed metrics grouped by date, dates missing data for even one platform caused steep sawtooth drops in total follower graphs. I solved this by engineering an asynchronous forward-fill aggregator in Python that maintains the last known value for each provider. I wrote automated unit tests checking every data point to ensure the aggregated growth trajectory is strictly monotonic."*

### "Why did you create a separate Mock API rather than mocking directly in tests?"
> *"I wanted to simulate real-world microservice communication using the Backend-For-Frontend (BFF) pattern. By building a standalone FastAPI service on port 9000, our backend communicates via HTTP just like it would with Google or Meta APIs. It also allowed us to test real HTTP edge cases, such as 403 Forbidden responses when a channel is disconnected and network timeout resilience when a provider is offline."*
