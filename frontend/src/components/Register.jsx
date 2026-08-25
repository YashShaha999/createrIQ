import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { User, Mail, Lock, Sparkles, Building2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

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
      const msg = err.response?.data?.detail || 'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="card-glow-bar" />

        {/* Header */}
        <div className="card-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-gradient)', marginBottom: '1rem', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <h2 className="card-title">Join CreatorIQ</h2>
          <p className="card-subtitle">Create your account to start managing creators & campaigns</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              <User size={15} /> Full Name
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
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
              <Mail size={15} /> Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="register-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="alex@creatoriq.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              <Lock size={15} /> Password (Min. 6 chars)
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
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
                <Sparkles size={20} color="#ec4899" />
                <div className="role-title">Creator</div>
                <div className="role-desc">Talent & influencer</div>
              </div>

              <div
                className={`role-option ${formData.role === 'agency' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'agency' })}
              >
                <Building2 size={20} color="#3b82f6" />
                <div className="role-title">Agency</div>
                <div className="role-desc">Brand manager</div>
              </div>

              <div
                className={`role-option ${formData.role === 'admin' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
              >
                <ShieldCheck size={20} color="#10b981" />
                <div className="role-title">Admin</div>
                <div className="role-desc">Platform manager</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-register-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Sign Up & Launch Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
