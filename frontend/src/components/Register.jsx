import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { User, Mail, Lock, BarChart3, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'creator',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="card-glow-bar" />

        {/* Brand Header */}
        <div className="card-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', marginBottom: '0.85rem' }}>
            <BarChart3 size={24} color="#ffffff" />
          </div>
          <h2 className="card-title">Create an Account</h2>
          <p className="card-subtitle">Sign up to manage your social channels & analytics</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              <User size={14} /> Full Name
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                id="register-name"
                name="full_name"
                type="text"
                className="form-input"
                placeholder="e.g. Alex Morgan"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              <Mail size={14} /> Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                id="register-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="e.g. alex@creatoriq.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              <Lock size={14} /> Password (Min. 6 characters)
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                id="register-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter a secure password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Role Selector Grid */}
          <div className="form-group">
            <label className="form-label">Select Account Role</label>
            <div className="role-grid">
              <div
                className={`role-option ${formData.role === 'creator' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'creator' })}
              >
                <User size={18} color="#db2777" />
                <div className="role-title">Creator</div>
                <div className="role-desc">Content Creator</div>
              </div>

              <div
                className={`role-option ${formData.role === 'agency' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'agency' })}
              >
                <Building2 size={18} color="#2563eb" />
                <div className="role-title">Agency</div>
                <div className="role-desc">Brand / Manager</div>
              </div>

              <div
                className={`role-option ${formData.role === 'admin' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                <ShieldCheck size={18} color="#16a34a" />
                <div className="role-title">Admin</div>
                <div className="role-desc">Administrator</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-register-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? <span>Creating Account...</span> : <span>Register Account</span>}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
