import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { AlertCircle, ExternalLink, Plus, Trash2, Video, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const PLATFORMS = ["youtube", "instagram", "facebook", "x"];

export default function Content() {
  const [tab, setTab] = useState("live");            // "live" | "custom"
  const [platform, setPlatform] = useState("youtube");
  const [live, setLive] = useState([]);
  const [custom, setCustom] = useState([]);
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Custom post form state
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState("youtube");
  const [newUrl, setNewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load connections
  const fetchConnections = () => {
    api.get("/api/social/connections")
      .then((r) => setConnected(r.data.connected || []))
      .catch(() => {});
  };

  // Load custom posts (Milestone 1)
  const fetchCustomPosts = () => {
    api.get("/api/content/")
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.contents || []);
        setCustom(list);
      })
      .catch(() => {
        // Fallback endpoint without trailing slash
        api.get("/api/content")
          .then((r) => {
            const list = Array.isArray(r.data) ? r.data : (r.data?.contents || []);
            setCustom(list);
          })
          .catch(() => {});
      });
  };

  useEffect(() => {
    fetchConnections();
    fetchCustomPosts();
  }, []);

  // Load live feed when tab+platform changes
  useEffect(() => {
    if (tab !== "live") return;
    if (!connected.includes(platform)) {
      setLive([]);
      setError(`${platform.toUpperCase()} is not connected.`);
      return;
    }
    setLoading(true);
    setError("");
    api.get(`/api/social/${platform}/content`)
      .then((r) => {
        setLive(Array.isArray(r.data) ? r.data : []);
      })
      .catch((e) => setError(e.response?.data?.detail || "Failed to load feed"))
      .finally(() => setLoading(false));
  }, [tab, platform, connected]);

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/api/content", {
        title: newTitle.trim(),
        platform: newPlatform,
        url: newUrl.trim(),
        views: Math.floor(Math.random() * 45000) + 1500,
        likes: Math.floor(Math.random() * 3500) + 120,
        engagement_rate: Number((Math.random() * 4 + 3.5).toFixed(1))
      });
      setNewTitle("");
      setNewUrl("");
      fetchCustomPosts();
    } catch (err) {
      alert("Failed to publish content item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom post?")) return;
    try {
      await api.delete(`/api/content/${id}`);
      setCustom((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete content item.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Content Management Hub" />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Content</h1>
              <p className="text-slate-500 mt-1 text-sm">
                Live social provider feeds and your custom MongoDB content catalog.
              </p>
            </div>

            {/* Tab switcher */}
            <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {[["live", "Live Social Feed"], ["custom", "Custom Posts (DB)"]].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === k
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          {tab === "live" && (
            <>
              {/* Platform pills */}
              <div className="flex gap-2.5 mb-6 flex-wrap">
                {PLATFORMS.map((p) => {
                  const isConnected = connected.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all flex items-center gap-2 ${
                        platform === p
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      } ${isConnected ? "" : "opacity-60"}`}
                    >
                      <span>{p === "x" ? "X / Twitter" : p}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isConnected ? (platform === p ? "bg-white" : "bg-emerald-500") : "bg-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm">
                  <AlertCircle size={18} className="shrink-0 text-amber-600" />
                  <span className="flex-1 font-medium">{error}</span>
                  <Link
                    to="/dashboard#channels"
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Connect on Dashboard →
                  </Link>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 text-slate-500 text-sm p-8">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Loading feed from {platform}…</span>
                </div>
              )}

              {!loading && live.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {live.map((item) => (
                    <LiveCard
                      key={item.platform_content_id || item.video_id || item.post_id || item.tweet_id || Math.random()}
                      item={item}
                      platform={platform}
                    />
                  ))}
                </div>
              )}

              {!loading && !error && live.length === 0 && (
                <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
                  No content found for {platform}.
                </div>
              )}
            </>
          )}

          {tab === "custom" && (
            <div>
              {/* Quick Publish Form */}
              <form onSubmit={handleCreateCustom} className="bg-white border border-slate-200 p-6 rounded-2xl mb-8 shadow-sm">
                <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-blue-600" />
                  Publish New Custom Content Post
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Post / Video Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
                  />
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-600 text-sm cursor-pointer"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="x">X / Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Content URL (optional)"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-white transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    {submitting ? "Publishing..." : "Add to Library"}
                  </button>
                </div>
              </form>

              {/* Custom posts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {custom.length === 0 && (
                  <div className="col-span-full p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
                    No custom posts yet in database.
                  </div>
                )}
                {custom.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <Video size={16} className="text-blue-600 shrink-0" />
                        <span>{item.title}</span>
                      </h3>
                      <button
                        onClick={() => handleDeleteCustom(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {item.platform}
                      </span>
                      <span>👁 {item.views?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function LiveCard({ item, platform }) {
  const title = item.title || item.caption || item.message || item.text || "(no title)";
  const likes = item.likes ?? item.like_count ?? 0;
  const comments = item.comments ?? item.comments_count ?? item.replies ?? 0;
  const views = item.views ?? item.impressions ?? item.reach ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {item.thumbnail && (
          <img src={item.thumbnail} alt="" className="w-full h-44 object-cover" />
        )}
        <div className="p-5">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-4 leading-snug">
            {title}
          </h3>
          <div className="flex justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
            <span>👍 {likes.toLocaleString()}</span>
            <span>💬 {comments.toLocaleString()}</span>
            <span>👁 {views.toLocaleString()}</span>
          </div>
        </div>
      </div>
      {item.url && (
        <div className="px-5 pb-4">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            View on {platform === "x" ? "X / Twitter" : platform} <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
