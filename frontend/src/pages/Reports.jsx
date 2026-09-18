import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Download, FileText, CheckCircle2 } from "lucide-react";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/analytics/multi-platform")
      .then((r) => setData(r.data))
      .catch((err) => console.error("Error loading report data:", err))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Platform", "Channel Name", "Followers", "Views", "Revenue (USD)"],
      ...(data.platforms || []).map((p) => [
        p.platform,
        `"${p.username || ""}"`,
        p.followers || 0,
        p.views || 0,
        p.revenue_usd || 0
      ]),
      [],
      ["TOTAL CONSOLIDATED", "All Streams", data.totals?.followers || 0, data.totals?.views || 0, data.totals?.revenue_usd || 0]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `creatoriq-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAudienceCsv = async () => {
    try {
      const res = await api.get("/api/analytics/audience-merged");
      const aud = res.data || {};
      const rows = [["Category", "Label", "Percent"]];
      (aud.age || []).forEach((r) => rows.push(["Age", `"${r.range || r.label || ""}"`, r.percent]));
      (aud.gender || []).forEach((r) => rows.push(["Gender", `"${r.label || ""}"`, r.percent]));
      (aud.countries || []).forEach((r) => rows.push(["Country", `"${r.country || r.label || ""}"`, r.percent]));
      (aud.devices || []).forEach((r) => rows.push(["Device", `"${r.device || r.label || ""}"`, r.percent]));

      const today = new Date().toISOString().slice(0, 10);
      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `audience-report-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export audience CSV:", err);
    }
  };

  const exportRevenueCsv = async () => {
    try {
      const res = await api.get("/api/analytics/revenue-detailed");
      const rev = res.data || {};
      const rows = [["Platform", "Amount USD"]];
      (rev.by_platform || []).forEach((p) => rows.push([p.platform, p.amount]));
      rows.push(["TOTAL", rev.total_usd ?? 0]);

      const today = new Date().toISOString().slice(0, 10);
      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `revenue-report-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export revenue CSV:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Creator Reporting & Exports" />
        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Channel Reports</h1>
              <p className="text-slate-500 mt-1 text-sm">
                Generate and download audit-ready CSV exports of your channel performance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportCsv}
                disabled={!data || loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={exportAudienceCsv}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-600/20"
              >
                <Download size={16} />
                <span>Export Audience CSV</span>
              </button>
              <button
                onClick={exportRevenueCsv}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-600/20"
              >
                <Download size={16} />
                <span>Export Revenue CSV</span>
              </button>
            </div>
          </header>

          {loading && (
            <div className="p-16 text-center text-slate-400 text-sm">
              Compiling channel reporting data…
            </div>
          )}

          {!loading && data && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Multi-Platform Audit Summary</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4 text-left">Platform</th>
                      <th className="p-4 text-left">Account Handle</th>
                      <th className="p-4 text-right">Reach / Followers</th>
                      <th className="p-4 text-right">Total Impressions</th>
                      <th className="p-4 text-right">Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.platforms?.map((p) => (
                      <tr key={p.platform} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900 capitalize flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {p.platform}
                        </td>
                        <td className="p-4 text-slate-600">{p.username || "—"}</td>
                        <td className="p-4 text-right font-medium">{(p.followers || 0).toLocaleString()}</td>
                        <td className="p-4 text-right font-medium">{(p.views || 0).toLocaleString()}</td>
                        <td className="p-4 text-right font-semibold text-emerald-700">
                          ${p.revenue_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td className="p-4" colSpan={2}>Consolidated Totals</td>
                      <td className="p-4 text-right">{(data.totals?.followers || 0).toLocaleString()}</td>
                      <td className="p-4 text-right">{(data.totals?.views || 0).toLocaleString()}</td>
                      <td className="p-4 text-right text-emerald-700">
                        ${data.totals?.revenue_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
