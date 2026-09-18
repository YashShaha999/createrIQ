import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Edit3,
  Save,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Video,
  Share2,
  Calendar,
  Youtube,
  Instagram,
  Twitter,
  AtSign
} from "lucide-react";

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [contentCount, setContentCount] = useState(0);

  // In-place editable form state
  const [form, setForm] = useState({
    name: "",
    bio: "",
    social_links: {
      youtube: "",
      instagram: "",
      twitter: "",
      facebook: ""
    }
  });

  // Fetch live profile and user's content stats from MongoDB Atlas
  const loadProfile = async () => {
    try {
      const res = await api.get("/api/auth/me");
      const userData = res.data;
      setProfile(userData);
      setForm({
        name: userData.name || "",
        bio: userData.bio || "",
        social_links: {
          youtube: userData.social_links?.youtube || "",
          instagram: userData.social_links?.instagram || "",
          twitter: userData.social_links?.twitter || "",
          facebook: userData.social_links?.facebook || ""
        }
      });
      updateUser(userData);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }

    try {
      const contentRes = await api.get("/api/content");
      setContentCount(contentRes.data?.count || 0);
    } catch (err) {
      console.error("Failed to load content count:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: "", type: "" });

    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        social_links: {
          youtube: form.social_links.youtube.trim(),
          instagram: form.social_links.instagram.trim(),
          twitter: form.social_links.twitter.trim(),
          facebook: form.social_links.facebook.trim()
        }
      };

      const res = await api.put("/api/auth/me", payload);
      const updatedUser = res.data;

      setProfile(updatedUser);
      updateUser(updatedUser);
      setEditMode(false);
      setStatusMsg({ text: "Profile updated successfully in MongoDB Atlas!", type: "success" });
    } catch (err) {
      setStatusMsg({
        text: err.response?.data?.detail || "Failed to update profile. Please try again.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar title="My Profile" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading profile from MongoDB...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = profile || authUser;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Profile & Account Settings" />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Creator Profile</h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Manage your personal bio, linked social accounts, and account details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditMode(!editMode);
                  setStatusMsg({ text: "", type: "" });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  editMode
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20"
                }`}
              >
                {editMode ? (
                  <>
                    <X size={16} /> Cancel Editing
                  </>
                ) : (
                  <>
                    <Edit3 size={16} /> Edit Profile
                  </>
                )}
              </button>
            </div>

            {/* Notification Alert */}
            {statusMsg.text && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 border ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Profile Overview Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl border-2 border-blue-200 shrink-0">
                  {getInitials(user?.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900">{user?.name || "Creator User"}</h2>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wider ${
                        user?.role === "admin"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {user?.role === "admin" ? "🛡️ Admin" : "🎥 Creator"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail size={14} className="text-slate-400" />
                      {user?.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active Account
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Overview KPI stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cataloged Posts</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{contentCount}</p>
                <p className="text-xs text-slate-400 mt-0.5">Published videos & posts</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Channels</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">3 Platforms</p>
                <p className="text-xs text-slate-400 mt-0.5">YouTube, Instagram, X</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage & Database</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">Synced</p>
                <p className="text-xs text-slate-400 mt-0.5">MongoDB Atlas Cloud</p>
              </div>
            </div>

            {/* View Mode vs Edit Mode Section */}
            {!editMode ? (
              <div className="space-y-6">
                {/* Creator Bio Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-2">Creator Bio & Statement</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {user?.bio || "No bio provided yet. Click 'Edit Profile' above to write your introduction or creator statement."}
                  </p>
                </div>

                {/* Connected Social Accounts Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Share2 size={18} className="text-blue-600" />
                    Linked Social Channels
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                          <Youtube size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">YouTube</p>
                          <p className="text-sm font-medium text-slate-800">
                            {user?.social_links?.youtube || "Not connected"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                          <Instagram size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Instagram</p>
                          <p className="text-sm font-medium text-slate-800">
                            {user?.social_links?.instagram || "Not connected"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                          <Twitter size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">X / Twitter</p>
                          <p className="text-sm font-medium text-slate-800">
                            {user?.social_links?.twitter || "Not connected"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Facebook */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          f
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500">Facebook</p>
                          <p className="text-sm font-medium text-slate-800">
                            {user?.social_links?.facebook || "Not connected"}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* In-Place Edit Form */
              <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-bold text-slate-800">Edit Profile Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Changes will be saved directly to your MongoDB Atlas user document.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Bio / Creator Statement
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell evaluators and creators about your content, experience, and projects..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Linked Social Handles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">YouTube Channel</label>
                      <input
                        type="text"
                        placeholder="@MyChannel"
                        value={form.social_links.youtube}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            social_links: { ...form.social_links, youtube: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Instagram Handle</label>
                      <input
                        type="text"
                        placeholder="@my_instagram"
                        value={form.social_links.instagram}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            social_links: { ...form.social_links, instagram: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">X / Twitter</label>
                      <input
                        type="text"
                        placeholder="@my_twitter"
                        value={form.social_links.twitter}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            social_links: { ...form.social_links, twitter: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Facebook Page</label>
                      <input
                        type="text"
                        placeholder="YourPageName"
                        value={form.social_links.facebook}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            social_links: { ...form.social_links, facebook: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white text-slate-800 text-sm"
                      />
                    </div>

                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-white transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    <Save size={16} />
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg text-slate-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
