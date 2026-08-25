import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import {
  ShieldCheck,
  Users,
  Search,
  RefreshCw,
  Sparkles,
  Building2,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [health, setHealth] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, healthRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/health').catch(() => ({ data: null }))
      ]);
      setUsers(usersRes.data.users || []);
      if (healthRes.data) setHealth(healthRes.data);
    } catch (err) {
      console.error('Admin fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="badge badge-admin"><ShieldCheck size={12} /> Administrator</span>;
      case 'agency':
        return <span className="badge badge-agency"><Building2 size={12} /> Agency</span>;
      default:
        return <span className="badge badge-creator"><Sparkles size={12} /> Creator</span>;
    }
  };

  const creatorCount = users.filter((u) => u.role === 'creator').length;
  const agencyCount = users.filter((u) => u.role === 'agency').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout pageTitle="Administrator Control Center">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={26} color="#10b981" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
              System & User Administration
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Supervise registered platform accounts, role delegations, and database health.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary" disabled={loading}>
          <RefreshCw size={16} />
          <span>{loading ? 'Refreshing...' : 'Refresh Records'}</span>
        </button>
      </div>

      {/* Admin KPI Stats */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Accounts</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-blue)' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="kpi-value">{users.length}</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive">Verified</span>
            <span className="trend-subtitle">in MongoDB Atlas</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Creators</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-creator)' }}>
              <Sparkles size={22} />
            </div>
          </div>
          <div className="kpi-value">{creatorCount}</div>
          <div className="kpi-bottom">
            <span className="trend-badge badge-creator">Talent Base</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Agencies</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-agency)' }}>
              <Building2 size={22} />
            </div>
          </div>
          <div className="kpi-value">{agencyCount}</div>
          <div className="kpi-bottom">
            <span className="trend-badge badge-agency">Brand Managers</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">System Admins</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-admin)' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="kpi-value">{adminCount}</div>
          <div className="kpi-bottom">
            <span className="trend-badge badge-admin">Elevated Access</span>
          </div>
        </div>
      </div>

      {/* Database Health Card */}
      {health && (
        <div className="card" style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="brand-icon-box" style={{ background: 'var(--gradient-emerald)' }}>
              <Database size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Database Cluster Status</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{health.database}</div>
            </div>
          </div>
          <div className="db-status-pill">
            <span className="status-dot" />
            <span>Health Check: OK</span>
          </div>
        </div>
      )}

      {/* Users Table Card */}
      <div className="card">
        <div className="card-header-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#6366f1" />
            <h3 className="card-heading">Platform Registered Accounts</h3>
          </div>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ padding: '0.45rem 0.75rem 0.45rem 2.25rem', fontSize: '0.85rem' }}
              placeholder="Search user / role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Bio / Details</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id || u.email}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.full_name || 'N/A'}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.bio || '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default AdminPanel;
