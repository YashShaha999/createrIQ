import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KpiCard from "../components/KpiCard";
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import {
  RefreshCw, ExternalLink, Sparkles, Youtube, Instagram,
  Facebook, Twitter, Check, Loader2, AlertCircle, Link2, Unlink
} from "lucide-react";

// Platform brand colors
const PIE_COLORS = ["#ef4444", "#ec4899", "#2563eb", "#0f172a"];

const PLATFORM_META = {
  youtube:   { label: "YouTube",     handle: "@techwithyash", Icon: Youtube,   color: "text-red-600",    border: "border-red-200",    bg: "bg-red-50 text-red-700" },
  instagram: { label: "Instagram",   handle: "@techwithyash", Icon: Instagram, color: "text-pink-600",   border: "border-pink-200",   bg: "bg-pink-50 text-pink-700" },
  facebook:  { label: "Facebook",    handle: "@techwithyash", Icon: Facebook,  color: "text-blue-600",   border: "border-blue-200",   bg: "bg-blue-50 text-blue-700" },
  x:         { label: "X (Twitter)", handle: "@techwithyash", Icon: Twitter,   color: "text-slate-800",  border: "border-slate-300",  bg: "bg-slate-100 text-slate-800" },
};

const ALL_PLATFORMS = ["youtube", "instagram", "facebook", "x"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [multi, setMulti] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [busyPlatform, setBusyPlatform] = useState(null);
  const [channelError, setChannelError] = useState("");

  const loadData = async () => {
    try {
      const [sumRes, multiRes, connRes] = await Promise.all([
        api.get("/api/analytics/dashboard/summary").catch((err) => console.error("Summary err:", err)),
        api.get("/api/analytics/multi-platform").catch((err) => console.error("Multi err:", err)),
        api.get("/api/social/connections").catch((err) => console.error("Connections err:", err)),
      ]);
      if (sumRes?.data) setData(sumRes.data);
      if (multiRes?.data) setMulti(multiRes.data);
      if (connRes?.data) setConnections(connRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleChannel = async (platform, isConnected) => {
    setBusyPlatform(platform);
    setChannelError("");
    try {
      const verb = isConnected ? "disconnect" : "connect";
      const res = await api.post(`/api/social/${platform}/${verb}`);
      const nextConnected = Array.isArray(res?.data?.connected)
        ? res.data.connected
        : (Array.isArray(res?.data?.active_connections) ? res.data.active_connections : []);
      setConnections({
        user_id: res?.data?.user_id || "",
        all_platforms: ALL_PLATFORMS,
        connected: nextConnected,
        not_connected: ALL_PLATFORMS.filter((p) => !nextConnected.includes(p))
      });
      await loadData();
    } catch (err) {
      setChannelError(err.response?.data?.detail || `Failed to ${isConnected ? "disconnect" : "connect"} ${platform}`);
    } finally {
      setBusyPlatform(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar title="Dashboard" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading creator metrics & live channels...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeConnectedList = Array.isArray(connections?.connected)
    ? connections.connected
    : [];
  const connectedCount = activeConnectedList.length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Dashboard Overview" />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Welcome Banner & Sync Now */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome, {data?.user || "Creator"} 👋
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                Here is your live multi-platform audience, channel integrations, and performance breakdown.
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing || !!busyPlatform}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "Syncing Feed…" : "🔄 Sync Now"}</span>
            </button>
          </div>

          {/* 4 Dynamic KPI Cards with Real Mock API Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <KpiCard
              title="Total Views"
              value={data?.kpis?.total_views != null ? data.kpis.total_views.toLocaleString() : "0"}
              change={connectedCount > 0 && data?.kpis?.view_growth_pct != null ? `+${data.kpis.view_growth_pct}%` : "+0%"}
              subtitle="30-day view trajectory"
            />
            <KpiCard
              title="Total Likes"
              value={data?.kpis?.total_likes != null ? data.kpis.total_likes.toLocaleString() : "0"}
              change={connectedCount > 0 ? "+12.8%" : "+0%"}
              subtitle="across all synced posts"
            />
            <KpiCard
              title="Total Followers"
              value={data?.kpis?.followers != null ? data.kpis.followers.toLocaleString() : "0"}
              change={connectedCount > 0 && data?.kpis?.follower_growth_pct != null ? `+${data.kpis.follower_growth_pct}%` : "+0%"}
              subtitle="active community reach"
            />
            <KpiCard
              title="Engagement Rate"
              value={data?.kpis?.engagement_rate != null ? `${data.kpis.engagement_rate}%` : "0%"}
              change={connectedCount > 0 ? "+0.4%" : "+0%"}
              subtitle="interactions / impressions"
            />
          </div>

          {/* Connected Channels & Integration Controls (Integrated Directly in Dashboard) */}
          <section className="mb-8" id="channels">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Link2 size={18} className="text-blue-600" />
                  Connected Channels & Integrations
                </h2>
                <p className="text-xs text-slate-500">
                  Manage live provider syncs. Toggle connect/disconnect to control real-time syndication and analytics.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                {connectedCount} of {ALL_PLATFORMS.length} Channels Connected
              </span>
            </div>

            {channelError && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <span>{channelError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ALL_PLATFORMS.map((platformKey) => {
                const meta = PLATFORM_META[platformKey] || {
                  label: platformKey,
                  handle: "@creator",
                  Icon: Link2,
                  color: "text-slate-600",
                  border: "border-slate-200",
                  bg: "bg-slate-50 text-slate-700"
                };
                const Icon = meta.Icon;
                const isConnected = activeConnectedList.includes(platformKey);
                const platformData = multi?.platforms?.find((p) => p.platform === platformKey);
                const isBusy = busyPlatform === platformKey;

                return (
                  <div
                    key={platformKey}
                    className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${
                      isConnected
                        ? "border-blue-200 ring-1 ring-blue-50 hover:shadow-md"
                        : "border-slate-200 bg-slate-50/50 opacity-90"
                    }`}
                  >
                    <div>
                      {/* Platform header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          {platformData?.avatar ? (
                            <img
                              src={platformData.avatar}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                              <Icon size={20} className={meta.color} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm">{meta.label}</h3>
                            <p className="text-xs text-slate-500 truncate">
                              {platformData?.username || meta.handle}
                            </p>
                          </div>
                        </div>

                        {isConnected ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check size={11} strokeWidth={3} /> Active
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Offline
                          </span>
                        )}
                      </div>

                      {/* Channel Metrics (if connected) or Disconnected prompt */}
                      {isConnected ? (
                        <div className="space-y-1.5 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100 mb-4">
                          <div className="flex justify-between text-slate-600">
                            <span className="text-slate-500">Audience:</span>
                            <span className="font-semibold text-slate-800">
                              {platformData?.followers != null ? platformData.followers.toLocaleString() : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span className="text-slate-500">Impressions:</span>
                            <span className="font-semibold text-slate-800">
                              {platformData?.views != null ? platformData.views.toLocaleString() : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500 font-normal">Est. Revenue:</span>
                            <span>
                              ${platformData?.revenue_usd != null ? platformData.revenue_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-white text-center mb-4">
                          <p className="text-xs text-slate-400 font-medium">
                            Channel disconnected. Click below to reconnect & sync live feed.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Integrated Connect / Disconnect Action Button */}
                    <button
                      onClick={() => handleToggleChannel(platformKey, isConnected)}
                      disabled={!!busyPlatform}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isConnected
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20"
                      } disabled:opacity-50`}
                    >
                      {isBusy && <Loader2 size={13} className="animate-spin" />}
                      {isConnected ? (
                        <>
                          <Unlink size={13} />
                          <span>Disconnect Channel</span>
                        </>
                      ) : (
                        <>
                          <Link2 size={13} />
                          <span>Connect Channel</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Aggregated Totals Summary */}
            {multi?.totals && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <Totals label="Total Audience Reach" value={multi.totals.followers} />
                <Totals label="Combined Platform Views" value={multi.totals.views} />
                <Totals
                  label="Aggregated Revenue"
                  value={`$${multi.totals.revenue_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </div>
            )}
          </section>

          {/* Top Performing Content Section */}
          {data?.top_content && data.top_content.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    Top Performing Content
                  </h2>
                  <p className="text-xs text-slate-500">Ranked by impressions and reach across all connected feeds</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {data.top_content.length} posts ranked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.top_content.slice(0, 8).map((item) => {
                  const meta = PLATFORM_META[item.platform] || { color: "text-slate-700", bg: "bg-slate-100 text-slate-800" };
                  return (
                    <div
                      key={item.id}
                      className="group flex flex-col justify-between bg-slate-50/60 hover:bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                    >
                      <div>
                        {item.thumbnail ? (
                          <div className="relative h-36 overflow-hidden bg-slate-100">
                            <img
                              src={item.thumbnail}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-xs ${meta.bg}`}>
                              {item.platform}
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 pb-0">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.bg}`}>
                              {item.platform}
                            </span>
                          </div>
                        )}
                        <div className="p-3 pb-2">
                          <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                            {item.title}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 pt-0">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 mb-2">
                          <span>👁 {item.views?.toLocaleString()}</span>
                          <span>👍 {item.likes?.toLocaleString()}</span>
                          <span className="font-semibold text-blue-600">⚡ {item.engagement_rate}%</span>
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <span>View Post</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Chart 1: Growth Trajectory Trends (Line Chart) */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Growth Trajectory Trends</h2>
                <p className="text-xs text-slate-500">Continuous 30-day syndicated trajectory (daily views vs cumulative follower reach)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Monotonic Growth
              </span>
            </div>

            {data?.chart_data && data.chart_data.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.5rem",
                        color: "#1e293b",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      name="Daily Views"
                      dataKey="views"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#2563eb" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      name="Follower Reach"
                      dataKey="followers"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#0ea5e9" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-semibold text-slate-600">No trajectory data available</p>
                <p className="text-xs text-slate-400 mt-1">Connect one or more channels above to view combined audience growth</p>
              </div>
            )}
          </div>

          {/* Charts 2 & 3: Platform Share (Donut) & Audience Growth (Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Share Pie Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-800">Platform Distribution</h2>
                <p className="text-xs text-slate-500">Audience share across connected social platforms</p>
              </div>

              {data?.platform_share && data.platform_share.length > 0 ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.platform_share}
                        dataKey="value"
                        nameKey="platform"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.platform_share.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                          borderRadius: "0.5rem",
                          color: "#1e293b",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-semibold text-slate-600">No distribution data</p>
                  <p className="text-xs text-slate-400 mt-1">Connect channels to see audience share</p>
                </div>
              )}
            </div>

            {/* Audience Growth Bar Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-800">Daily View Impressions</h2>
                <p className="text-xs text-slate-500">Daily impression accumulation curve from mock syndication</p>
              </div>

              {data?.chart_data && data.chart_data.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                          borderRadius: "0.5rem",
                          color: "#1e293b",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
                        }}
                      />
                      <Bar
                        dataKey="views"
                        name="Impressions / Day"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-semibold text-slate-600">No impression data</p>
                  <p className="text-xs text-slate-400 mt-1">Connect channels to see daily impressions</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Totals({ label, value }) {
  return (
    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 shadow-sm">
      <p className="text-[11px] uppercase text-blue-700 font-bold tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold text-blue-900 mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
