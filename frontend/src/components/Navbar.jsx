import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { Database, Bell, Check } from "lucide-react";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
}

export default function Navbar({ title = "Dashboard" }) {
  const [dbStatus, setDbStatus] = useState("checking");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = () => {
    api.get("/api/notifications/unread-count")
      .then((res) => setUnreadCount(res.data?.count || 0))
      .catch(() => {});
  };

  const fetchNotifications = () => {
    api.get("/api/notifications")
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  };

  useEffect(() => {
    api.get("/health/db")
      .then((res) => {
        if (res.data?.mongodb === "connected") {
          setDbStatus("connected");
        } else {
          setDbStatus("disconnected");
        }
      })
      .catch(() => setDbStatus("disconnected"));

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Notifications"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkRead(item.id, item.read)}
                      className={`p-3.5 transition-colors cursor-pointer text-left ${
                        !item.read ? "bg-blue-50/60 hover:bg-blue-50" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!item.read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live MongoDB Atlas Health Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            dbStatus === "connected"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : dbStatus === "checking"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <Database size={14} className={dbStatus === "connected" ? "text-emerald-600" : "text-amber-600"} />
          <span>MongoDB Atlas:</span>
          {dbStatus === "connected" ? (
            <span className="font-semibold flex items-center gap-1.5">
              Connected
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </span>
          ) : dbStatus === "checking" ? (
            <span>Connecting...</span>
          ) : (
            <span className="font-semibold text-rose-600">Offline</span>
          )}
        </div>
      </div>
    </header>
  );
}

