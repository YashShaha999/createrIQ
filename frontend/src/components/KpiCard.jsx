import { TrendingUp } from "lucide-react";

export default function KpiCard({ title, value, change = "+12.4%", subtitle = "vs last month" }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <TrendingUp size={12} />
          {change}
        </span>
      </div>
      <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{value}</p>
      <p className="text-slate-500 text-xs mt-1 font-medium">{subtitle}</p>
    </div>
  );
}

