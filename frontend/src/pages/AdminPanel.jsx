import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Search,
  UserPlus,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  Shield,
  Database
} from "lucide-react";

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" });

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "creator"
  });

  // Load all users from MongoDB Atlas via Admin API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const r = await api.get("/api/admin/users");
      setUsers(r.data?.users || []);
    } catch (err) {
      console.error("Error loading admin users:", err);
      setActionMessage({ text: "Failed to load user directory from MongoDB.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Quick Role Toggle (Creator <-> Admin)
  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === "admin" ? "creator" : "admin";
    if (targetUser.id === currentUser?.id || targetUser.email === currentUser?.email) {
      if (!window.confirm(`Warning: You are modifying your own role to '${nextRole}'. Proceed?`)) {
        return;
      }
    }

    try {
      await api.patch(`/api/admin/users/${targetUser.id}/role`, { role: nextRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: nextRole } : u))
      );
      setActionMessage({
        text: `Successfully updated ${targetUser.name}'s role to '${nextRole}'!`,
        type: "success"
      });
    } catch (err) {
      setActionMessage({
        text: err.response?.data?.detail || "Failed to update user role.",
        type: "error"
      });
    }
  };

  // Delete User with Self-Deletion Guard
  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser?.id || targetUser.email === currentUser?.email) {
      alert("Self-Protection: You cannot delete your own active administrator account!");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete account '${targetUser.name}' (${targetUser.email}) from MongoDB Atlas?`)) {
      return;
    }

    try {
      await api.delete(`/api/admin/users/${targetUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setActionMessage({
        text: `User account '${targetUser.name}' deleted successfully.`,
        type: "success"
      });
    } catch (err) {
      setActionMessage({
        text: err.response?.data?.detail || "Failed to delete user.",
        type: "error"
      });
    }
  };

  // Create New User via Admin Modal
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setActionMessage({ text: "", type: "" });

    try {
      const res = await api.post("/api/admin/users", {
        name: newUserForm.name.trim(),
        email: newUserForm.email.trim(),
        password: newUserForm.password,
        role: newUserForm.role
      });

      const created = res.data;
      setUsers((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewUserForm({ name: "", email: "", password: "", role: "creator" });
      setActionMessage({
        text: `New user '${created.name}' registered successfully!`,
        type: "success"
      });
    } catch (err) {
      setActionMessage({
        text: err.response?.data?.detail || "Failed to create user account.",
        type: "error"
      });
    } finally {
      setAddingUser(false);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "all" || u.role?.toLowerCase() === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  const creatorsCount = users.filter((u) => u.role !== "admin").length;
  const adminsCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Administrator Control Panel" />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="text-blue-600" size={24} />
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administrator Panel</h1>
              </div>
              <p className="text-slate-500 text-sm">
                Role-Based Access Control (RBAC), user directory oversight, and account provisioning.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm shadow-sm flex items-center gap-1.5 transition-colors"
                title="Refresh user directory"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => {
                  setShowAddModal(true);
                  setActionMessage({ text: "", type: "" });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-white text-sm shadow-sm shadow-blue-600/20 flex items-center gap-2 transition-all"
              >
                <UserPlus size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Action Notification Alert */}
          {actionMessage.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between border ${
                actionMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {actionMessage.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
              <button
                onClick={() => setActionMessage({ text: "", type: "" })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users size={18} />
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{users.length}</p>
              <p className="text-xs text-slate-400 mt-1">Platform-wide registered</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Creator Accounts</p>
                <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                  <User size={18} />
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{creatorsCount}</p>
              <p className="text-xs text-slate-400 mt-1">Content creators</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Administrators</p>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Shield size={18} />
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{adminsCount}</p>
              <p className="text-xs text-slate-400 mt-1">Supervisors & admins</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Status</p>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Database size={18} />
                </span>
              </div>
              <p className="text-3xl font-bold text-emerald-600 mt-2 tracking-tight">Active</p>
              <p className="text-xs text-slate-400 mt-1">MongoDB Atlas Connected</p>
            </div>
          </div>

          {/* User Directory Table Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Table Filter Bar */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Platform User Directory ({filteredUsers.length})</h3>
                <p className="text-xs text-slate-500">Live accounts queried directly from MongoDB Atlas</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Search input */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 w-64"
                  />
                </div>

                {/* Role Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  {[
                    { id: "all", label: "All Users" },
                    { id: "creator", label: "Creators" },
                    { id: "admin", label: "Admins" }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoleFilter(r.id)}
                      className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${
                        roleFilter === r.id
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading users from MongoDB Atlas...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No users found matching your search or role filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-center">Quick Role Change</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === currentUser?.id || u.email === currentUser?.email;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                                {u.name ? u.name[0].toUpperCase() : "U"}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <span>{u.name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Mail size={12} />
                                  <span>{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wider ${
                                u.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {u.role === "admin" ? "Admin" : "Creator"}
                            </span>
                          </td>

                          <td className="p-4 text-xs text-slate-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Just now"}
                          </td>

                          {/* Quick Role Toggle (Creator <-> Admin) */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                              title={`Click to switch role to ${u.role === "admin" ? "Creator" : "Admin"}`}
                            >
                              Make {u.role === "admin" ? "Creator" : "Admin"}
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSelf
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              }`}
                              title={isSelf ? "You cannot delete your own account" : "Delete user"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add User Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-800">Add New User</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Creator"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Password (min. 6 characters)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Assign Role
                    </label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm cursor-pointer"
                    >
                      <option value="creator">Creator (Personal Content & Analytics)</option>
                      <option value="admin">Administrator (Full System Access)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={addingUser}
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-white transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} />
                      {addingUser ? "Creating User..." : "Create Account"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg text-slate-700 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
