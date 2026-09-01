import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  User, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Building2
} from 'lucide-react';
import api from '../api';

function Layout({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ healthy: true, text: 'Atlas Connected' });
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Health check to verify live MongoDB Atlas connection
    const checkDb = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.status === 'healthy') {
          setDbStatus({ healthy: true, text: 'Database: Connected ✅' });
        } else {
          setDbStatus({ healthy: false, text: 'Database: Offline' });
        }
      } catch (err) {
        setDbStatus({ healthy: false, text: 'API: Disconnected' });
      }
    };
    checkDb();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="badge badge-admin"><ShieldCheck size={12} /> Admin</span>;
      case 'agency':
        return <span className="badge badge-agency"><Building2 size={12} /> Agency</span>;
      default:
        return <span className="badge badge-creator"><User size={12} /> Creator</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="layout-container">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 45
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <Link to="/dashboard" className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
          <div className="brand-icon-box">
            <BarChart3 size={20} color="#ffffff" />
          </div>
          <div>
            <div className="brand-text">CreatorIQ</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Creator Management Portal</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <ul className="sidebar-nav">
          <li className="nav-section-title">Main Menu</li>
          
          <li>
            <Link 
              to="/dashboard" 
              className={`nav-item-link ${isActive('/dashboard')}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-item-icon"><LayoutDashboard size={18} /></span>
              <span>Dashboard</span>
            </Link>
          </li>

          <li>
            <Link 
              to="/analytics" 
              className={`nav-item-link ${isActive('/analytics')}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-item-icon"><BarChart3 size={18} /></span>
              <span>Analytics</span>
            </Link>
          </li>

          <li>
            <Link 
              to="/content" 
              className={`nav-item-link ${isActive('/content')}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-item-icon"><FileText size={18} /></span>
              <span>Content</span>
            </Link>
          </li>

          <li>
            <Link 
              to="/profile" 
              className={`nav-item-link ${isActive('/profile')}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-item-icon"><User size={18} /></span>
              <span>My Profile</span>
            </Link>
          </li>

          {/* Admin Section if role is admin */}
          {user?.role === 'admin' && (
            <>
              <li className="nav-section-title" style={{ marginTop: '0.75rem' }}>Administration</li>
              <li>
                <Link 
                  to="/admin" 
                  className={`nav-item-link ${isActive('/admin')}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-item-icon"><ShieldCheck size={18} color="#22c55e" /></span>
                  <span>Admin Panel</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* User Card in Sidebar */}
        <div className="sidebar-user-card">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt={user.full_name} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                getInitials(user?.full_name)
              )}
            </div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{user?.full_name || 'Creator User'}</div>
              <div className="sidebar-user-email">{user?.email || 'user@creatoriq.com'}</div>
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Role:</span>
            {getRoleBadge(user?.role)}
          </div>

          <button id="btn-sidebar-logout" onClick={handleLogout} className="btn-logout">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Content */}
      <div className="app-main">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="header-title-wrap">
              <h1 className="header-page-title">{pageTitle || 'CreatorIQ Portal'}</h1>
            </div>
          </div>

          <div className="header-right">
            <div className="db-status-pill">
              <span className="status-dot" style={{ background: dbStatus.healthy ? '#16a34a' : '#dc2626' }} />
              <span>{dbStatus.text}</span>
            </div>

            <Link 
              to="/profile" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'var(--text-main)',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: '#f8fafc',
                border: '1px solid var(--border-dark)',
                fontSize: '0.85rem'
              }}
            >
              <div className="sidebar-avatar" style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}>
                {getInitials(user?.full_name)}
              </div>
              <span style={{ fontWeight: 600 }}>{user?.full_name?.split(' ')[0] || 'Profile'}</span>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
