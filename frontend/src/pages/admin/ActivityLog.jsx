import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Activity, UserPlus, Clock } from "lucide-react";

export default function ActivityLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/activity")
      .then((r) => setEvents(r.data || []))
      .catch((err) => console.error("Error loading activity log:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Platform Activity Log" />
        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Audit & Activity</h1>
            <p className="text-slate-500 text-sm mt-1">
              Historical ledger of user onboarding, privilege grants, and system events.
            </p>
          </header>

          {loading ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              Loading recent audit events…
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-2xl">
              No recent activity recorded.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                <Activity size={18} className="text-purple-600" />
                <h3 className="font-bold text-slate-800 text-sm">Recent Audit Events ({events.length})</h3>
              </div>

              <div className="divide-y divide-slate-100">
                {events.map((ev, idx) => (
                  <div key={idx} className="p-5 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0 mt-0.5">
                      <UserPlus size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">
                          {ev.name || "User"} registered account
                        </p>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {ev.at ? new Date(ev.at).toLocaleString() : "Recently"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Email: <span className="font-mono text-slate-700">{ev.email}</span> &bull; Assigned Role: <span className="font-semibold text-purple-700 uppercase">{ev.role}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
