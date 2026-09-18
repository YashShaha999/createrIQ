import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.utils.dependencies import get_current_user
from app.services import social_service

router = APIRouter(tags=["Analytics"])
api_router = APIRouter(prefix="/api/analytics", tags=["Analytics (v1)"])

def _uid(user: dict) -> str:
    return str(user.get("id") or user.get("_id") or user.get("email") or "demo_user")

def _followers(profile: dict) -> int:
    return (
        profile.get("followers")
        or profile.get("subscribers")
        or profile.get("followers_count")
        or 0
    )

def _views(profile: dict) -> int:
    return profile.get("total_views") or profile.get("views") or 0

def _sum_numeric(d: dict) -> float:
    return round(sum(v for v in d.values() if isinstance(v, (int, float))), 2)

def _content_score(item: dict, platform: str) -> int:
    """Unified score for ranking content across different platform metrics."""
    if platform == "youtube":
        return item.get("views", 0)
    return item.get("impressions") or item.get("reach") or item.get("views", 0)

def compute_growth_rate(series: list[dict], field: str) -> float:
    """Calculates percentage growth between first and last data points in a series."""
    if len(series) < 2:
        return 0.0
    first, last = series[0].get(field, 0), series[-1].get(field, 0)
    if first == 0:
        return 0.0
    return round(((last - first) / first) * 100, 1)

def _aggregate_growth(growths_by_platform: dict[str, list[dict]]) -> list[dict]:
    """
    Forward-fill aggregator: tracks last known value per platform to prevent
    sawtooth drops when platforms have sparse or misaligned date entries.
    """
    per_platform = {}
    all_dates = set()
    for p, pts in growths_by_platform.items():
        if isinstance(pts, list):
            per_platform[p] = {row["date"]: row for row in pts if isinstance(row, dict) and "date" in row}
            all_dates.update(row["date"] for row in pts if isinstance(row, dict) and "date" in row)

    if not all_dates:
        return []

    sorted_dates = sorted(all_dates)
    last_known = {p: {"followers": 0, "views": 0} for p in per_platform}
    result = []

    for dt in sorted_dates:
        row = {"date": dt, "followers": 0, "views": 0}
        for p, by_date in per_platform.items():
            if dt in by_date:
                last_known[p] = by_date[dt]
            row["followers"] += last_known[p].get("followers", 0)
            row["views"] += last_known[p].get("views", 0)
        result.append(row)

    return result

async def _fetch_platform_full(user_id: str, p: str) -> dict:
    """Fetches profile, content, revenue, and growth for platform p from mock-api."""
    entry = {
        "platform": p,
        "connected": True,
        "username": "",
        "avatar": None,
        "followers": 0,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "revenue_usd": 0.0,
        "growth": [],
        "items": []
    }
    try:
        profile = await social_service.get_profile(user_id, p)
        entry["username"] = (
            profile.get("username")
            or profile.get("name")
            or profile.get("handle")
            or profile.get("display_name")
            or p
        )
        entry["avatar"] = profile.get("avatar")
        entry["followers"] = _followers(profile)
        if p == "youtube":
            entry["views"] = profile.get("total_views") or profile.get("views") or 0
        elif p == "facebook":
            entry["likes"] = profile.get("likes") or 0
    except Exception:
        pass

    try:
        items = await social_service.get_content(user_id, p)
        entry["items"] = items or []
        for it in (items or []):
            v = it.get("views") or it.get("impressions") or it.get("reach") or 0
            if p != "youtube":
                entry["views"] += v
            entry["likes"] += it.get("likes") or 0
            entry["comments"] += it.get("comments") or it.get("replies") or 0
            entry["shares"] += it.get("shares") or it.get("retweets") or 0
    except Exception:
        pass

    try:
        revenue = await social_service.get_revenue(user_id, p)
        entry["revenue_usd"] = _sum_numeric(revenue)
    except Exception:
        pass

    try:
        growth = await social_service.get_growth(user_id, p)
        if isinstance(growth, list):
            entry["growth"] = growth
    except Exception:
        pass

    return entry


async def _summary(user=Depends(get_current_user)):
    user_id = _uid(user)
    user_name = user.get("name") or user.get("full_name") or user["email"].split("@")[0]

    connected = await social_service.list_connections(user_id)

    entries = await asyncio.gather(*(_fetch_platform_full(user_id, p) for p in connected))

    total_followers = sum(e["followers"] for e in entries)
    total_views = sum(e["views"] for e in entries)
    total_likes = sum(e["likes"] for e in entries)
    total_comments = sum(e["comments"] for e in entries)
    total_shares = sum(e["shares"] for e in entries)

    # Calculate real engagement rate: (likes + comments + shares) / max(views, 1) * 100
    engagement_rate = round(
        ((total_likes + total_comments + total_shares) / max(total_views, 1)) * 100,
        2
    )

    # Dynamic platform share for pie chart based on real follower distribution
    platform_share = []
    for e in entries:
        p_name = {
            "youtube": "YouTube",
            "instagram": "Instagram",
            "facebook": "Facebook",
            "x": "X / Twitter"
        }.get(e["platform"], e["platform"].capitalize())

        platform_share.append({
            "platform": p_name,
            "value": e["followers"],
            "share_pct": round((e["followers"] / max(total_followers, 1)) * 100, 1)
        })

    # Forward-fill combined growth trajectory across all connected platforms
    growths_by_p = {e["platform"]: e.get("growth", []) for e in entries}
    growth_series = _aggregate_growth(growths_by_p)

    follower_growth_pct = compute_growth_rate(growth_series, "followers")
    view_growth_pct = compute_growth_rate(growth_series, "views")

    # Format chart_data with readable date labels for the last 7 points
    chart_data = []
    for pt in (growth_series[-7:] if len(growth_series) >= 7 else growth_series):
        d = pt["date"]
        dt_label = d
        try:
            dt = datetime.strptime(d, "%Y-%m-%d")
            dt_label = dt.strftime("%b %d")
        except Exception:
            pass
        chart_data.append({
            "date": dt_label,
            "raw_date": d,
            "views": pt["views"],
            "followers": pt["followers"]
        })


    # Collect and rank top content from mock media items
    all_content = []
    for e in entries:
        p = e["platform"]
        for it in e.get("items", []):
            score = _content_score(it, p)
            title = (
                it.get("title")
                or it.get("caption")
                or it.get("message")
                or (it.get("text", "")[:80] + "..." if len(it.get("text", "")) > 80 else it.get("text", ""))
            )
            likes = it.get("likes") or 0
            comments = it.get("comments") or it.get("replies") or 0
            shares = it.get("shares") or it.get("retweets") or 0
            interactions = likes + comments + shares
            eng_rate = round((interactions / max(score, 1)) * 100, 1) if score > 0 else 0.0

            all_content.append({
                "id": str(it.get("platform_content_id") or it.get("id") or title[:12]),
                "title": title,
                "platform": p,
                "thumbnail": it.get("thumbnail"),
                "url": it.get("url"),
                "views": score,
                "likes": likes,
                "comments": comments,
                "shares": shares,
                "engagement_rate": eng_rate,
                "published_at": it.get("published_at")
            })

    all_content.sort(key=lambda x: x["views"], reverse=True)
    top_content = all_content[:8]

    return {
        "user": user_name,
        "role": user.get("role", "creator"),
        "kpis": {
            "total_views": total_views,
            "total_likes": total_likes,
            "followers": total_followers,
            "engagement_rate": engagement_rate,
            "follower_growth_pct": follower_growth_pct,
            "view_growth_pct": view_growth_pct,
        },
        "chart_data": chart_data,
        "platform_share": platform_share,
        "top_content": top_content
    }

# Mount on both root (/dashboard/summary) and /api/analytics/dashboard
router.get("/dashboard/summary")(_summary)
api_router.get("/dashboard/summary")(_summary)
api_router.get("/dashboard")(_summary)


# ---------- Multi-Platform Unified Analytics ----------

@router.get("/api/analytics/multi-platform")
@api_router.get("/multi-platform")
async def multi_platform(user=Depends(get_current_user)):
    """Aggregates followers, views, likes, revenue across connected platforms."""
    user_id = _uid(user)
    connected = await social_service.list_connections(user_id)

    entries = await asyncio.gather(*(_fetch_platform_full(user_id, p) for p in connected))

    platforms = []
    totals = {
        "followers": 0,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "revenue_usd": 0.0,
        "connected_count": len(connected)
    }

    for e in entries:
        platforms.append({
            "platform": e["platform"],
            "connected": True,
            "username": e["username"],
            "avatar": e["avatar"],
            "followers": e["followers"],
            "views": e["views"],
            "likes": e["likes"],
            "revenue_usd": round(e["revenue_usd"], 2)
        })
        totals["followers"] += e["followers"]
        totals["views"] += e["views"]
        totals["likes"] += e["likes"]
        totals["comments"] += e["comments"]
        totals["revenue_usd"] += e["revenue_usd"]

    totals["revenue_usd"] = round(totals["revenue_usd"], 2)
    return {"platforms": platforms, "totals": totals}


@router.get("/api/analytics/audience-merged")
@api_router.get("/audience-merged")
async def audience_merged(user=Depends(get_current_user)):
    """Merges demographics across all connected platforms."""
    user_id = _uid(user)
    connected = await social_service.list_connections(user_id)
    age, gender, countries, devices = {}, {}, {}, {}

    async def fetch_demo(p):
        try:
            return await social_service.get_demographics(user_id, p)
        except HTTPException:
            return None

    demos = await asyncio.gather(*(fetch_demo(p) for p in connected)) if connected else []

    for demo in demos:
        if not demo:
            continue
        for row in demo.get("age", []):
            age[row["range"]] = age.get(row["range"], 0) + row["percent"]
        for row in demo.get("gender", []):
            gender[row["label"]] = gender.get(row["label"], 0) + row["percent"]
        for row in demo.get("countries", []):
            countries[row["country"]] = countries.get(row["country"], 0) + row["percent"]
        for row in demo.get("devices", []):
            devices[row["device"]] = devices.get(row["device"], 0) + row["percent"]

    def _normalize(d):
        total = sum(d.values()) or 1
        return sorted(
            [{"label": k, "percent": round(v / total * 100, 2)} for k, v in d.items()],
            key=lambda x: -x["percent"],
        )

    return {
        "platforms_count": len(connected),
        "age":     [{"range": k, "percent": round(v / max(len(connected), 1), 2)}
                    for k, v in sorted(age.items())],
        "gender":  _normalize(gender),
        "countries": _normalize(countries)[:5],
        "devices": _normalize(devices),
    }


@router.get("/api/analytics/trends")
@api_router.get("/trends")
async def trends(user=Depends(get_current_user)):
    """Combines follower/view trajectories by date across platforms with forward-fill."""
    user_id = _uid(user)
    connected = await social_service.list_connections(user_id)
    growths_by_p = {}

    for p in (connected or []):
        try:
            pts = await social_service.get_growth(user_id, p)
            growths_by_p[p] = pts
        except HTTPException:
            continue

    return _aggregate_growth(growths_by_p)


@router.get("/api/analytics/revenue-detailed")
@api_router.get("/revenue-detailed")
async def revenue_detailed(user=Depends(get_current_user)):
    user_id = _uid(user)
    connected = await social_service.list_connections(user_id)

    by_platform = []
    monthly_map = {}
    sponsorships = []
    total_usd = 0.0

    for p in connected:
        p_amount = 0.0
        try:
            rev_dict = await social_service.get_revenue(user_id, p)
            if isinstance(rev_dict, dict):
                p_amount = _sum_numeric(rev_dict)
        except Exception:
            pass

        by_platform.append({"platform": p, "amount": round(p_amount, 2)})
        total_usd += p_amount

        try:
            trends_list = await social_service.get_resource(user_id, p, "revenue_trends")
            if isinstance(trends_list, list):
                for row in trends_list:
                    m = row.get("month")
                    if m:
                        monthly_map[m] = monthly_map.get(m, 0.0) + row.get("total", 0)
        except Exception:
            pass

        try:
            spons_list = await social_service.get_resource(user_id, p, "sponsorships")
            if isinstance(spons_list, list):
                for item in spons_list:
                    sponsorships.append({
                        "brand": item.get("brand", ""),
                        "amount": item.get("amount", 0),
                        "date": item.get("date", ""),
                        "platform": p
                    })
        except Exception:
            pass

    monthly_trends = [
        {"month": m, "total": round(monthly_map[m], 2)}
        for m in sorted(monthly_map.keys())
    ]
    sponsorships.sort(key=lambda x: x.get("date", ""), reverse=True)

    return {
        "total_usd": round(total_usd, 2),
        "by_platform": by_platform,
        "monthly_trends": monthly_trends,
        "sponsorships": sponsorships
    }


