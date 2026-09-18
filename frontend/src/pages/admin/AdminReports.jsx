import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Download, Shield, FileText } from "lucide-react";

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/stats")
      .then((r) => setStats(r.data))
      .catch((err) => console.error("Error loading admin stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    if (!stats) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Users", stats.total_users ?? 0],
      ["Total Custom Content", stats.total_content ?? 0],
      ["Total Platform Connections", stats.total_connections ?? 0],
      ["New Users (7 days)", stats.new_users_7d ?? 0],
      ...Object.entries(stats.roles || {}).map(([role, count]) => [`Users — ${role}`, count]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform-audit-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Platform Administrative Reports" />
        <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="text-purple-600" size={24} />
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Reports</h1>
              </div>
              <p className="text-slate-500 text-sm">
                Generate and export system-wide operational metrics and audit summaries.
              </p>
            </div>
            <button
              onClick={exportCsv}
              disabled={!stats || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-purple-600/20 disabled:opacity-50"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </header>

          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              Compiling administrative telemetry…
            </div>
          ) : stats && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <FileText size={18} className="text-purple-600" />
                <h2 className="font-bold text-slate-800 text-base">Consolidated Platform Summary</h2>
              </div>
              <ul className="space-y-3 text-sm">
                <Row label="Total Registered Accounts" value={stats.total_users ?? 0} />
                <Row label="Total Custom Content Items" value={stats.total_content ?? 0} />
                <Row label="Total Provider Channel Connections" value={stats.total_connections ?? 0} />
                <Row label="New User Onboardings (last 7 days)" value={stats.new_users_7d ?? 0} />
                {Object.entries(stats.roles || {}).map(([role, count]) => (
                  <Row key={role} label={`Registered Accounts (${role})`} value={count} />
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <li className="flex justify-between border-b border-slate-100 pb-2.5">
      <span className="text-slate-600">{label}</span>
      <span className="font-bold text-slate-900">{typeof value === "number" ? value.toLocaleString() : value}</span>
    </li>
  );
}
