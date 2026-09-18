import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
         Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Users, Link2 } from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];

export default function AudienceAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/analytics/audience-merged")
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.detail || "Failed to load audience analytics"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Audience Demographics" />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Audience Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Aggregated demographics and audience intelligence across all connected social channels.
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="p-16 text-center text-slate-400 text-sm">
              Loading audience intelligence…
            </div>
          )}

          {!loading && data && data.platforms_count === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <Users className="mx-auto text-slate-300 mb-3" size={48} />
              <h3 className="font-bold text-slate-800 text-lg">No platforms connected</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6 max-w-md mx-auto">
                Connect YouTube, Instagram, Facebook, or X on the Dashboard to see aggregated demographics.
              </p>
              <Link
                to="/dashboard#channels"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-sm transition-colors"
              >
                <Link2 size={16} />
                Manage Channels on Dashboard
              </Link>
            </div>
          )}

          {!loading && data && data.platforms_count > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Gender Distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.gender}
                      dataKey="percent"
                      nameKey="label"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {(data.gender || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => `${v}%`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Age Distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.age}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v) => `${v}%`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
                      }}
                    />
                    <Bar dataKey="percent" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Top Countries">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.countries} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="label" stroke="#94a3b8" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v) => `${v}%`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
                      }}
                    />
                    <Bar dataKey="percent" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Devices Distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.devices}
                      dataKey="percent"
                      nameKey="label"
                      outerRadius={95}
                      label={({ label, percent }) => `${label}: ${percent}%`}
                    >
                      {(data.devices || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => `${v}%`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-slate-800 text-base mb-4">{title}</h2>
      {children}
    </div>
  );
}
