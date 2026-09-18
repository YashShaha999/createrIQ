import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileVideo, Users, DollarSign, FileText,
  Shield, Server, Activity, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CREATOR_MENU = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/content",   label: "Content",   icon: FileVideo },
  { to: "/audience",  label: "Audience",  icon: Users },
  { to: "/revenue",   label: "Revenue",   icon: DollarSign },
  { to: "/reports",   label: "Reports",   icon: FileText },
];

const ADMIN_MENU = [
  { to: "/admin",          label: "Platform Overview",  icon: LayoutDashboard },
  { to: "/admin/users",    label: "User Management",    icon: Users },
  { to: "/admin/system",   label: "System Health",      icon: Server },
  { to: "/admin/activity", label: "Activity Log",       icon: Activity },
  { to: "/admin/content",  label: "Content Moderation", icon: FileVideo },
  { to: "/admin/reports",  label: "Reports",            icon: FileText },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  const isAdmin = (user.role || "").toLowerCase() === "admin";
  const items = isAdmin ? ADMIN_MENU : CREATOR_MENU;

  // Different accent per role
  const accent = isAdmin
    ? {
        brand: "text-purple-600",
        active: "bg-purple-50 text-purple-700 font-semibold shadow-sm shadow-purple-100",
        badge: "bg-purple-100 text-purple-700",
        dot: "bg-purple-600"
      }
    : {
        brand: "text-blue-600",
        active: "bg-blue-50 text-blue-700 font-semibold shadow-sm shadow-blue-100",
        badge: "bg-blue-100 text-blue-700",
        dot: "bg-blue-600"
      };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isAdmin && <Shield size={20} className={accent.brand} />}
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Creator<span className={accent.brand}>IQ</span>
          </h1>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-block px-2.5 py-0.5 text-xs font-bold tracking-wider rounded-full uppercase ${accent.badge}`}>
            {isAdmin ? "ADMIN" : "CREATOR"}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {isAdmin ? "Platform Administration" : "Creator Studio"}
        </div>
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active ? accent.active : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} className={active ? accent.brand : "text-slate-400"} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${accent.badge}`}>
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user.role || "creator"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
