import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setNotice('Your session has expired. Please log in again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass, demoName, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    try {
      // First try login
      const res = await api.post('/auth/login', { email: demoEmail, password: demoPass });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
        return;
      }
    } catch (loginErr) {
      // If demo user doesn't exist yet in DB, auto-register them
      try {
        const regRes = await api.post('/auth/register', {
          email: demoEmail,
          password: demoPass,
          full_name: demoName,
          role: demoRole
        });
        if (regRes.data?.token) {
          localStorage.setItem('token', regRes.data.token);
          localStorage.setItem('user', JSON.stringify(regRes.data.user));
          navigate('/dashboard');
          return;
        }
      } catch (regErr) {
        setError('Unable to authenticate demo account. Please create a new account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="card-glow-bar" />

        {/* Brand Header */}
        <div className="card-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-gradient)', marginBottom: '1rem', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <h2 className="card-title">Welcome to CreatorIQ</h2>
          <p className="card-subtitle">Sign in to access your creator analytics dashboard</p>
        </div>

        {/* Notice & Error alerts */}
        {notice && (
          <div className="alert alert-error" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
            <AlertCircle size={18} />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail size={15} /> Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="creator@creatoriq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={15} /> Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Evaluation Box */}
        <div className="demo-logins-box">
          <div className="demo-title">⚡ Quick 1-Click Demo Accounts:</div>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={() => handleQuickDemo('alex.creator@creatoriq.com', 'password123', 'Alex Morgan', 'creator')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.78rem' }}
              disabled={loading}
            >
              <Sparkles size={13} color="#ec4899" />
              <span>Demo Creator</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@creatoriq.com', 'adminpass123', 'Sarah Admin', 'admin')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.78rem' }}
              disabled={loading}
            >
              <ShieldCheck size={13} color="#10b981" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Create one for free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
