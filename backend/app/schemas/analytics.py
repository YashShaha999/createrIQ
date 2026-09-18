from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class KPISummary(BaseModel):
    total_views: int
    total_likes: int
    followers: int
    engagement_rate: float

class DailyChartData(BaseModel):
    date: str
    views: int
    followers: Optional[int] = 0

class PlatformShare(BaseModel):
    platform: str
    value: int

class DashboardSummaryResponse(BaseModel):
    user: str
    role: str
    kpis: KPISummary
    chart_data: List[DailyChartData]
    platform_share: List[PlatformShare]
