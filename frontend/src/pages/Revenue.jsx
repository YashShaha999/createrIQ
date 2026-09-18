import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Revenue() {
  const [data, setData] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/analytics/multi-platform").catch((err) => console.error("Error loading revenue:", err)),
      api.get("/api/analytics/revenue-detailed").catch((err) => console.error("Error loading detailed revenue:", err))
    ])
      .then(([multiRes, detailedRes]) => {
        if (multiRes?.data) setData(multiRes.data);
        if (detailedRes?.data) setDetailed(detailedRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Channel Monetization & Revenue" />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revenue Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Your estimated earnings and monetized syndication across connected platforms.
            </p>
          </header>

          {loading && (
            <div className="p-16 text-center text-slate-400 text-sm">
              Calculating monetized revenue streams…
            </div>
          )}

          {!loading && data && (
            <div className="space-y-6">
              {/* Total Revenue Highlight Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg shadow-blue-600/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold tracking-wider text-blue-100">
                      Total Consolidated Revenue
                    </p>
                    <p className="text-4xl font-extrabold tracking-tight mt-2">
                      ${data.totals?.revenue_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </p>
                    <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                      <TrendingUp size={14} /> Synced across {data.platforms?.length || 0} active provider streams
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                    <DollarSign size={32} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Per-Platform Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {data.platforms?.map((p) => (
                  <div key={p.platform} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                        {p.platform}
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-base mb-1 truncate">
                      {p.username || "Channel Account"}
                    </p>

                    <p className="text-2xl font-extrabold text-emerald-600 mt-3">
                      ${p.revenue_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      👥 {(p.followers || 0).toLocaleString()} audience members
                    </p>
                  </div>
                ))}
              </div>

              {/* Section 1: Monthly Trend */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
                <h3 className="font-semibold text-slate-800 mb-4">Monthly Trend</h3>
                {detailed?.monthly_trends && detailed.monthly_trends.length > 0 ? (
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={detailed.monthly_trends}>
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                          formatter={(val) => [`$${Number(val).toLocaleString()}`, "Total Revenue"]}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        />
                        <Line dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-8 text-center">No trend data recorded</p>
                )}
              </div>

              {/* Section 2: Recent Sponsorships */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
                <h3 className="font-semibold text-slate-800 mb-4">Recent Sponsorships</h3>
                {detailed?.sponsorships && detailed.sponsorships.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="text-xs uppercase bg-slate-50 text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Brand</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Platform</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detailed.sponsorships.map((deal, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-900">{deal.brand}</td>
                            <td className="px-4 py-3 text-emerald-600 font-semibold">
                              ${Number(deal.amount || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">{deal.date}</td>
                            <td className="px-4 py-3 capitalize">
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                {deal.platform}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-8 text-center">No sponsorships recorded</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
