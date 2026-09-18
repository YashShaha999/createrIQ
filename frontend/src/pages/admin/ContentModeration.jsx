import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FileVideo, Search, ExternalLink } from "lucide-react";

export default function ContentModeration() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/content")
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch((err) => console.error("Error loading content for moderation:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((c) =>
    (c.title || "").toLowerCase().includes(filter.toLowerCase()) ||
    (c.platform || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Global Content Moderation" />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Content Moderation</h1>
            <p className="text-slate-500 text-sm mt-1">
              Audit and supervise all custom posts and media cataloged by creators across the platform.
            </p>
          </header>

          <div className="mb-6 relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Filter by title or platform…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-16 text-center text-slate-400 text-sm">
                Loading content for moderation…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4 text-left">Post / Media Title</th>
                      <th className="p-4 text-left">Platform</th>
                      <th className="p-4 text-left">Creator User ID</th>
                      <th className="p-4 text-left">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                          <FileVideo size={16} className="text-purple-600 shrink-0" />
                          <span>{c.title}</span>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-purple-600"
                              title="External link"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </td>
                        <td className="p-4 capitalize">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            {c.platform}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-xs font-mono">
                          {c.user_id ? c.user_id.slice(-8) : "—"}
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-slate-400">
                          No custom content posts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
