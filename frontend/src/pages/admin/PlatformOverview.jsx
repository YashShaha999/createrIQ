import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Users, FileVideo, Link2, TrendingUp, Shield, Server, CheckCircle2 } from "lucide-react";

export default function PlatformOverview() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/admin/stats").catch(() => null),
      api.get("/api/admin/system-health").catch(() => null),
    ])
      .then(([statsRes, healthRes]) => {
        if (statsRes?.data) setStats(statsRes.data);
        if (healthRes?.data) setHealth(healthRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Platform Overview" />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="text-purple-600" size={24} />
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Global system metrics, cross-creator reach, and platform-wide infrastructure status.
            </p>
          </header>

          {loading && (
            <div className="p-16 text-center text-slate-400 text-sm">
              Loading platform telemetry…
            </div>
          )}

          {!loading && (
            <div className="space-y-8">
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <AdminStatCard
                  title="Total Accounts"
                  value={stats?.total_users ?? 0}
                  icon={Users}
                  color="text-purple-600 bg-purple-50 border-purple-100"
                  subtitle={`${stats?.roles?.creator || 0} creators, ${stats?.roles?.admin || 0} admins`}
                />
                <AdminStatCard
                  title="Custom Content Posts"
                  value={stats?.total_content ?? 0}
                  icon={FileVideo}
                  color="text-blue-600 bg-blue-50 border-blue-100"
                  subtitle="MongoDB catalog items"
                />
                <AdminStatCard
                  title="Linked Channels"
                  value={stats?.total_connections ?? 0}
                  icon={Link2}
                  color="text-emerald-600 bg-emerald-50 border-emerald-100"
                  subtitle="Active social connections"
                />
                <AdminStatCard
                  title="7-Day Registrations"
                  value={stats?.new_users_7d ?? 0}
                  icon={TrendingUp}
                  color="text-amber-600 bg-amber-50 border-amber-100"
                  subtitle="New user onboarding velocity"
                />
              </div>

              {/* System Infrastructure Health Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Server size={18} className="text-purple-600" />
                    <h2 className="font-bold text-slate-800 text-base">Infrastructure Status</h2>
                  </div>
                  <span className="text-xs text-slate-400">Live Healthcheck</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ServiceTile
                    name="FastAPI Main Backend (:8000)"
                    status={health?.backend === "ok" ? "Operational" : health?.backend || "Checking"}
                    online={health?.backend === "ok"}
                  />
                  <ServiceTile
                    name="MongoDB Atlas Database"
                    status={health?.mongodb === "ok" ? "Operational" : health?.mongodb || "Checking"}
                    online={health?.mongodb === "ok"}
                  />
                  <ServiceTile
                    name="Mock Social Media Provider (:9000)"
                    status={health?.mock_api === "ok" ? "Operational" : health?.mock_api || "Checking"}
                    online={health?.mock_api === "ok"}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{title}</span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center border ${color}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value.toLocaleString()}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
}

function ServiceTile({ name, status, online }) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{name}</p>
        <p className={`text-sm font-bold mt-0.5 ${online ? "text-emerald-700" : "text-amber-700"}`}>
          {status}
        </p>
      </div>
      <span className={`w-2.5 h-2.5 rounded-full ${online ? "bg-emerald-500 ring-4 ring-emerald-100" : "bg-amber-500"}`} />
    </div>
  );
}
