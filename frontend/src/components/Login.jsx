import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, LogIn, AlertCircle, BarChart3, ShieldCheck, User } from 'lucide-react';

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
      const res = await api.post('/auth/login', { email: demoEmail, password: demoPass });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
        return;
      }
    } catch (loginErr) {
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
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', marginBottom: '0.85rem' }}>
            <BarChart3 size={24} color="#ffffff" />
          </div>
          <h2 className="card-title">CreatorIQ Portal</h2>
          <p className="card-subtitle">Sign in to your creator analytics account</p>
        </div>

        {/* Notices and Alerts */}
        {notice && (
          <div className="alert" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
            <AlertCircle size={17} />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail size={14} /> Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="e.g. alex@creatoriq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={14} /> Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
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
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Accounts Box */}
        <div className="demo-logins-box">
          <div className="demo-title">Test Demo Accounts (Quick Fill):</div>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={() => handleQuickDemo('alex.creator@creatoriq.com', 'password123', 'Alex Morgan', 'creator')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              disabled={loading}
            >
              <User size={13} color="#2563eb" />
              <span>Demo Creator</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@creatoriq.com', 'adminpass123', 'Sarah Admin', 'admin')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              disabled={loading}
            >
              <ShieldCheck size={13} color="#16a34a" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
