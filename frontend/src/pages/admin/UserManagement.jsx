import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Users, Search, Trash2, Shield, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users");
      const list = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      setUsers(list);
    } catch (err) {
      setMsg({ text: "Failed to load user directory.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (target) => {
    const nextRole = target.role === "admin" ? "creator" : "admin";
    if (target.id === currentUser?.id || target.email === currentUser?.email) {
      if (!window.confirm(`Warning: You are changing your own role to '${nextRole}'. Proceed?`)) {
        return;
      }
    }

    setBusyId(target.id);
    try {
      await api.put(`/api/admin/users/${target.id}/role`, { role: nextRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, role: nextRole } : u))
      );
      setMsg({ text: `Updated ${target.name}'s role to '${nextRole}'`, type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || "Failed to update role.", type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (target) => {
    if (target.id === currentUser?.id || target.email === currentUser?.email) {
      alert("Self-Protection: You cannot delete your own active administrator account!");
      return;
    }
    if (!window.confirm(`Permanently delete account for '${target.name}' (${target.email})?`)) {
      return;
    }

    setBusyId(target.id);
    try {
      await api.delete(`/api/admin/users/${target.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setMsg({ text: `Deleted user '${target.name}'`, type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || "Failed to delete user.", type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || (u.role || "creator").toLowerCase() === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="User Directory & Permissions" />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 text-sm mt-1">
              Administer creator and administrator accounts, roles, and connected privileges.
            </p>
          </header>

          {msg.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
                msg.type === "error"
                  ? "bg-rose-50 border border-rose-200 text-rose-800"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-800"
              }`}
            >
              {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {["all", "creator", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    roleFilter === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {r === "all" ? "All Users" : r}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Loading registered users…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-sm">
                No users match your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4 text-left">User</th>
                      <th className="p-4 text-left">Email Address</th>
                      <th className="p-4 text-left">Assigned Role</th>
                      <th className="p-4 text-center">Channels Linked</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((u) => {
                      const isSelf = u.id === currentUser?.id || u.email === currentUser?.email;
                      const isTargetAdmin = (u.role || "").toLowerCase() === "admin";
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                  isTargetAdmin
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {u.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                                {isSelf && <span className="text-[10px] text-purple-600 font-bold">(You)</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 text-xs font-mono">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                isTargetAdmin
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {isTargetAdmin ? <Shield size={12} /> : <User size={12} />}
                              <span className="capitalize">{u.role || "creator"}</span>
                            </span>
                          </td>
                          <td className="p-4 text-center text-slate-600 font-semibold">
                            {u.connected_platforms ?? 0}
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleRoleToggle(u)}
                                disabled={busyId === u.id}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
                              >
                                Switch to {isTargetAdmin ? "Creator" : "Admin"}
                              </button>
                              <button
                                onClick={() => handleDelete(u)}
                                disabled={busyId === u.id || isSelf}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30"
                                title={isSelf ? "Cannot delete self" : "Delete user"}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
