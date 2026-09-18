import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Sparkles, AlertCircle } from "lucide-react";

// Student Project Demo Accounts for Viva Evaluation
const DEMO_ACCOUNTS = [
  { label: "Demo Creator", email: "creator@test.com", password: "password123", role: "creator" },
  { label: "Demo Admin",   email: "admin@test.com",   password: "adminpassword123", role: "admin" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const navigateByRole = (authResult) => {
    const role = (authResult?.user?.role || authResult?.role || "").toLowerCase();
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await login(email, password);
      navigateByRole(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demo) => {
    setError("");
    setSubmitting(true);
    try {
      const res = await login(demo.email, demo.password);
      navigateByRole(res);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Could not connect to backend server. Make sure backend is running on port 8000."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm text-white font-bold text-2xl">
            <span>C</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">CreatorIQ Login</h2>
          <p className="text-slate-500 text-sm mt-1">Creator Management & Analytics Portal</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-5 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-50 text-sm"
          >
            <LogIn size={18} />
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* 1-Click Quick Demo Login for Student Viva / Presentation */}
        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mb-3">
            <Sparkles size={14} />
            <span>1-Click Demo Login (Viva / Presentation Mode)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                type="button"
                key={d.role}
                onClick={() => handleQuickLogin(d)}
                disabled={submitting}
                className="text-xs bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg font-medium transition-colors text-center"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-center text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

