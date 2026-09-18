import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { BarChart3, TrendingUp, Users, Target, Globe } from "lucide-react";

export default function Analytics() {
  const metrics = [
    { label: "Audience Retention", val: "72.4%", desc: "Average duration on video content", change: "+4.2%" },
    { label: "Click-Through Rate (CTR)", val: "8.9%", desc: "Thumbnail & headline conversions", change: "+1.3%" },
    { label: "Community Growth Rate", val: "+18.2%", desc: "Monthly follower net change", change: "+5.0%" },
    { label: "Viral Reach Coefficient", val: "1.42x", desc: "Organic sharing multiplier", change: "+0.15x" },
  ];

  const demographics = [
    { group: "18-24 years", pct: 42, color: "bg-blue-600" },
    { group: "25-34 years", pct: 36, color: "bg-sky-500" },
    { group: "35-44 years", pct: 14, color: "bg-emerald-500" },
    { group: "45+ years", pct: 8, color: "bg-amber-500" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Growth & Audience Analytics" />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deep-Dive Analytics</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Advanced engagement, conversion rates, and demographic breakdowns for your content.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {metrics.map((m) => (
              <div key={m.label} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{m.label}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {m.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{m.val}</p>
                <p className="text-slate-500 text-xs mt-1 font-medium">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Demographics & Geographic reach */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Demographics */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Audience Age Distribution</h2>
                  <p className="text-xs text-slate-500">Core viewer age demographics</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Global Reach
                </span>
              </div>

              <div className="space-y-4">
                {demographics.map((d) => (
                  <div key={d.group}>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-700">{d.group}</span>
                      <span className="text-blue-600 font-bold">{d.pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full transition-all`} style={{ width: `${d.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Reach */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe size={18} className="text-blue-600" />
                    Top Geographic Reach
                  </h2>
                  <p className="text-xs text-slate-500">Primary audience regional footprint</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { country: "United States", pct: "38%", flag: "🇺🇸" },
                  { country: "India", pct: "26%", flag: "🇮🇳" },
                  { country: "United Kingdom", pct: "14%", flag: "🇬🇧" },
                  { country: "Canada", pct: "12%", flag: "🇨🇦" },
                  { country: "Germany", pct: "10%", flag: "🇩🇪" },
                ].map((c) => (
                  <div key={c.country} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="text-lg">{c.flag}</span>
                      <span className="text-slate-800 font-medium">{c.country}</span>
                    </div>
                    <span className="text-blue-600 text-xs font-bold">{c.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

