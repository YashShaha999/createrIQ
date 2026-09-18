import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role can be a string OR array
  if (role) {
    const allowed = (Array.isArray(role) ? role : [role]).map((r) => r.toLowerCase());
    const userRole = (user.role || "creator").toLowerCase();
    if (!allowed.includes(userRole)) {
      // Redirect to user's appropriate workspace home
      return <Navigate to={userRole === "admin" ? "/admin" : "/dashboard"} replace />;
    }
  }

  return children;
}
