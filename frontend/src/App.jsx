import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// Creator pages
import Dashboard from "./pages/Dashboard";
import Channels from "./pages/Channels";
import Content from "./pages/Content";
import AudienceAnalytics from "./pages/AudienceAnalytics";
import Revenue from "./pages/Revenue";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

// Admin pages
import PlatformOverview from "./pages/admin/PlatformOverview";
import UserManagement from "./pages/admin/UserManagement";
import SystemHealth from "./pages/admin/SystemHealth";
import ActivityLog from "./pages/admin/ActivityLog";
import ContentModeration from "./pages/admin/ContentModeration";
import AdminReports from "./pages/admin/AdminReports";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Creator-only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="creator">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/content"
            element={
              <ProtectedRoute role="creator">
                <Content />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audience"
            element={
              <ProtectedRoute role="creator">
                <AudienceAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audience-analytics"
            element={
              <ProtectedRoute role="creator">
                <AudienceAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute role="creator">
                <Revenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute role="creator">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute role="creator">
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Shared Profile (Accessible to both Creator and Admin) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute role={["creator", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <PlatformOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system"
            element={
              <ProtectedRoute role="admin">
                <SystemHealth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute role="admin">
                <ActivityLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute role="admin">
                <ContentModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Default redirect — role-aware */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function RoleBasedRedirect() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if ((user?.role || "").toLowerCase() === "admin") {
      return <Navigate to="/admin" replace />;
    }
  } catch {
    // ignore parse error
  }
  return <Navigate to="/dashboard" replace />;
}
