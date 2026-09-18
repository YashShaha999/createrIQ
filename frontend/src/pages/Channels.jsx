import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Youtube, Instagram, Facebook, Twitter, Check, Loader2, AlertCircle } from "lucide-react";

const META = {
  youtube:   { Icon: Youtube,   label: "YouTube",     color: "text-red-500",    accent: "border-red-200 bg-red-50" },
  instagram: { Icon: Instagram, label: "Instagram",   color: "text-pink-500",   accent: "border-pink-200 bg-pink-50" },
  facebook:  { Icon: Facebook,  label: "Facebook",    color: "text-blue-500",   accent: "border-blue-200 bg-blue-50" },
  x:         { Icon: Twitter,   label: "X (Twitter)", color: "text-slate-700",  accent: "border-slate-300 bg-slate-50" },
};

export default function Channels() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/api/social/connections");
      setState(data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load connections");
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (platform, isConnected) => {
    setBusy(platform);
    setError("");
    try {
      const verb = isConnected ? "disconnect" : "connect";
      const { data: res } = await api.post(`/api/social/${platform}/${verb}`);
      if (res?.active_connections) {
        setState((prev) => ({
          ...(prev || {}),
          connected: res.active_connections,
          not_connected: (prev?.all_platforms || []).filter((p) => !res.active_connections.includes(p))
        }));
      }
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  if (!state) {
    return (
      <Shell>
        <div className="flex items-center justify-center p-16">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="animate-spin" size={20} />
            <span>Loading channels…</span>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Connected Channels</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Toggle platforms on or off. Live analytics and content feeds appear only for connected channels.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-2 mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {state.all_platforms.map((p) => {
          const { Icon, label, color } = META[p] || { Icon: Youtube, label: p, color: "text-slate-600" };
          const connected = state.connected.includes(p);
          const loading = busy === p;

          return (
            <div
              key={p}
              className={`rounded-2xl p-6 bg-white border ${
                connected ? "border-blue-300 shadow-sm ring-1 ring-blue-100" : "border-slate-200"
              } transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Icon size={28} className={color} />
                  </div>
                  {connected ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Check size={12} strokeWidth={3} /> Connected
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      Not connected
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1">{label}</h3>
                <p className="text-xs text-slate-500 mb-6">
                  {connected ? "Live data syncing active" : "Account not linked"}
                </p>
              </div>

              <button
                onClick={() => toggle(p, connected)}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  connected
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20"
                } disabled:opacity-50`}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Channels & Integrations" />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
