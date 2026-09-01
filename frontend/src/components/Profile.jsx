import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import api from '../api';
import {
  User,
  Mail,
  Edit3,
  LogOut,
  Save,
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube,
  Instagram,
  Twitter
} from 'lucide-react';

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    profile_picture: '',
    social_links: { youtube: '', instagram: '', tiktok: '', twitter: '' }
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        setForm({
          full_name: res.data.full_name || '',
          bio: res.data.bio || '',
          profile_picture: res.data.profile_picture || '',
          social_links: res.data.social_links || { youtube: '', instagram: '', tiktok: '', twitter: '' }
        });
        localStorage.setItem('user', JSON.stringify(res.data));

        if (res.data.role === 'admin') {
          loadAllUsers();
        }
      } catch (err) {
        const cached = localStorage.getItem('user');
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setForm({
            full_name: parsed.full_name || '',
            bio: parsed.bio || '',
            profile_picture: parsed.profile_picture || '',
            social_links: parsed.social_links || { youtube: '', instagram: '', tiktok: '', twitter: '' }
          });
        } else {
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users');
      setAdminUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load admin user list', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ text: '', type: '' });

    try {
      const res = await api.put('/auth/me', form);
      const updated = { ...user, ...res.data.user };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditMode(false);
      setStatusMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setStatusMessage({
        text: err.response?.data?.detail || 'Failed to update profile.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <Layout pageTitle="User Profile">
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading profile details...
        </div>
      </Layout>
    );
  }

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
    <Layout pageTitle="My Profile">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Status Notification */}
        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type}`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div 
                className="sidebar-avatar" 
                style={{ 
                  width: '72px', 
                  height: '72px', 
                  fontSize: '1.75rem', 
                  border: '2px solid var(--border-dark)',
                  background: 'var(--primary)'
                }}
              >
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.full_name} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  getInitials(user.full_name)
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {user.full_name || 'Creator User'}
                  </h2>
                  {getRoleBadge(user.role)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                  <Mail size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                  {user.email}
                </div>
              </div>
            </div>

            <div>
              <button
                id="btn-toggle-edit-profile"
                onClick={() => setEditMode(!editMode)}
                className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
              >
                {editMode ? <X size={15} /> : <Edit3 size={15} />}
                <span>{editMode ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* View Mode vs Edit Mode */}
          {!editMode ? (
            <div>
              {/* Profile Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="demo-group-box">
                  <div className="demo-group-title">Bio / Statement</div>
                  <p style={{ color: user.bio ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {user.bio || 'No bio provided yet. Click "Edit Profile" to add one.'}
                  </p>
                </div>

                <div className="demo-group-box">
                  <div className="demo-group-title">Account Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Role:</span>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Registered:</span>
                      <span style={{ fontWeight: 600 }}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Social Channels */}
              <div className="demo-group-box" style={{ marginBottom: '1.5rem' }}>
                <div className="demo-group-title">
                  <LinkIcon size={14} /> Linked Social Accounts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <Youtube size={16} color="#dc2626" />
                    <span>{user.social_links?.youtube || '@youtube'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <Instagram size={16} color="#db2777" />
                    <span>{user.social_links?.instagram || '@instagram'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <Twitter size={16} color="#0284c7" />
                    <span>{user.social_links?.twitter || '@twitter'}</span>
                  </div>
                </div>
              </div>

              {/* Logout Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button id="btn-profile-logout" onClick={handleLogout} className="btn btn-danger">
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-full-name">
                  <User size={14} /> Full Name
                </label>
                <input
                  id="edit-full-name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '0.85rem' }}
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-bio-input">
                  Bio / Description
                </label>
                <textarea
                  id="edit-bio-input"
                  className="form-textarea"
                  placeholder="Tell us about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-avatar-url">
                  <ImageIcon size={14} /> Profile Picture (URL)
                </label>
                <input
                  id="edit-avatar-url"
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="https://example.com/avatar.jpg"
                  value={form.profile_picture}
                  onChange={(e) => setForm({ ...form, profile_picture: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  id="btn-save-profile-changes"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Embedded Admin Panel if role is admin */}
        {user.role === 'admin' && (
          <div className="card">
            <div className="card-header-flex">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#16a34a" />
                <h3 className="card-heading">Registered System Users</h3>
              </div>
              <button
                onClick={loadAllUsers}
                className="btn btn-secondary btn-sm"
                disabled={loadingUsers}
              >
                {loadingUsers ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Total users registered in the database ({adminUsers.length}).
            </p>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id || u.email}>
                      <td style={{ fontWeight: 600 }}>{u.full_name || 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Profile;
