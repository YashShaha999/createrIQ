import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Server, Database, Globe, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    api.get("/api/admin/system-health")
      .then((r) => setHealth(r.data))
      .catch(() => setHealth({ backend: "ok", mongodb: "offline", mock_api: "unreachable" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="System Health & Infrastructure" />
        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <header className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Health</h1>
              <p className="text-slate-500 text-sm mt-1">
                Real-time connection monitoring for platform services and external mock gateways.
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm shadow-sm transition-colors"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-purple-600" : ""} />
              <span>Refresh Status</span>
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <HealthCard
              name="Main REST Backend"
              port="Port 8000"
              icon={Server}
              status={health?.backend || "ok"}
              ok={health?.backend === "ok"}
              desc="FastAPI service with JWT auth & proxy logic"
            />
            <HealthCard
              name="MongoDB Atlas"
              port="Cloud Cluster"
              icon={Database}
              status={health?.mongodb || "ok"}
              ok={health?.mongodb === "ok"}
              desc="Document store for users, roles & content"
            />
            <HealthCard
              name="Mock Provider API"
              port="Port 9000"
              icon={Globe}
              status={health?.mock_api || "ok"}
              ok={health?.mock_api === "ok"}
              desc="Simulated YouTube, IG, FB & X microservice"
            />
          </div>

          {health?.checked_at && (
            <p className="text-xs text-slate-400">
              Last automated healthcheck at: {new Date(health.checked_at).toLocaleString()}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

function HealthCard({ name, port, icon: Icon, status, ok, desc }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Icon size={24} />
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            <span>{ok ? "Operational" : "Degraded"}</span>
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-base">{name}</h3>
        <p className="text-xs font-mono text-slate-400 mb-2">{port}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">Ping detail:</span>
        <span className="font-semibold text-slate-700 font-mono">{status}</span>
      </div>
    </div>
  );
}
