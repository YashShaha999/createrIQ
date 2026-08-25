import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout from './Layout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Eye,
  Heart,
  Zap,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  Share2,
  RefreshCw,
  Youtube,
  Instagram,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [socialStatus, setSocialStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const [dashRes, growthRes, socialRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/growth').catch(() => ({ data: null })),
        api.get('/social/status').catch(() => ({ data: { platforms: [] } }))
      ]);

      setAnalytics(dashRes.data);
      if (growthRes.data) setGrowthData(growthRes.data);
      if (socialRes.data?.platforms) setSocialStatus(socialRes.data.platforms);
    } catch (err) {
      console.error('Error loading dashboard data', err);
      setError('Unable to fetch live analytics data. Please check backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Layout pageTitle="Creator Analytics">
        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div className="status-dot" style={{ width: '16px', height: '16px', margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Loading Your Analytics Dashboard...
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving latest performance metrics & charts</p>
        </div>
      </Layout>
    );
  }

  if (error && !analytics) {
    return (
      <Layout pageTitle="Creator Analytics">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '2rem auto' }}>
          <AlertCircle size={48} color="#f87171" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#f87171', marginBottom: '0.75rem' }}>
            Connection Issue
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchAllData} className="btn btn-primary">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </Layout>
    );
  }

  // Platform Distribution Pie Chart Data
  const platformData = analytics?.platform_breakdown ? [
    { name: 'YouTube', value: analytics.platform_breakdown.youtube || 0, color: '#ef4444' },
    { name: 'Instagram', value: analytics.platform_breakdown.instagram || 0, color: '#ec4899' },
    { name: 'TikTok', value: analytics.platform_breakdown.tiktok || 0, color: '#06b6d4' },
    { name: 'Facebook', value: analytics.platform_breakdown.facebook || 0, color: '#3b82f6' }
  ] : [];

  const getPlatformBadge = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return <span className="badge badge-youtube">YouTube</span>;
      case 'instagram':
        return <span className="badge badge-instagram">Instagram</span>;
      case 'tiktok':
        return <span className="badge badge-tiktok">TikTok</span>;
      default:
        return <span className="badge badge-facebook">Facebook</span>;
    }
  };

  return (
    <Layout pageTitle="Creator Analytics Dashboard">
      {/* Header Welcome & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800 }}>
              Welcome back, {user?.full_name || 'Creator'}! 👋
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your cross-platform content reach, audience insights, and performance growth.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            id="btn-refresh-dashboard"
            onClick={fetchAllData} 
            className="btn btn-secondary"
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'status-dot' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          
          <Link to="/content" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <PlusCircle size={16} />
            <span>Publish Content</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Views */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Views</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-blue)' }}>
              <Eye size={22} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.total_views ? analytics.total_views.toLocaleString() : '125,430'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={14} /> +12.5%
              </span>
              <span className="trend-subtitle">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Likes</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-creator)' }}>
              <Heart size={22} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.total_likes ? analytics.total_likes.toLocaleString() : '32,891'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={14} /> +8.3%
              </span>
              <span className="trend-subtitle">vs last month</span>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Engagement Rate</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-amber)' }}>
              <Zap size={22} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.engagement_rate ? `${analytics.engagement_rate}%` : '4.2%'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={14} /> +2.1%
              </span>
              <span className="trend-subtitle">industry high</span>
            </div>
          </div>
        </div>

        {/* Total Followers / Audience */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Followers</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-emerald)' }}>
              <Users size={22} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.total_followers ? analytics.total_followers.toLocaleString() : '8,234'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={14} /> +15.7%
              </span>
              <span className="trend-subtitle">new followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="charts-grid-2">
        {/* Weekly Performance Bar Chart */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-heading">
              <TrendingUp size={18} color="#6366f1" />
              <span>Weekly Performance</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Views vs Likes (Daily)</span>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.weekly_performance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f1422', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="views" name="Views" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="likes" name="Likes" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution Pie Chart */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-heading">
              <Sparkles size={18} color="#ec4899" />
              <span>Platform Distribution</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audience Share</span>
          </div>

          <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f1422', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#f8fafc' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Follower Growth Trend Chart */}
      {growthData?.follower_growth && (
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header-flex">
            <h3 className="card-heading">
              <Users size={18} color="#10b981" />
              <span>6-Month Follower & Audience Growth</span>
            </h3>
            <span className="trend-badge trend-positive">
              <ArrowUpRight size={14} /> +200% Total Gain
            </span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData.follower_growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f1422', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#f8fafc' 
                  }} 
                />
                <Area type="monotone" dataKey="followers" name="Followers" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#growthGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Audience Demographics */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header-flex">
          <h3 className="card-heading">
            <Users size={18} color="#06b6d4" />
            <span>Audience Demographics & Geo Distribution</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Global Community</span>
        </div>

        <div className="demographics-grid">
          {/* Age Groups */}
          <div className="demo-group-box">
            <div className="demo-group-title">
              <Zap size={14} color="#6366f1" /> Age Groups
            </div>
            {Object.entries(analytics?.audience_demographics?.age_groups || { '18-24': 35, '25-34': 40, '35-44': 15, '45+': 10 }).map(([age, pct]) => (
              <div key={age} className="progress-item">
                <div className="progress-meta">
                  <span>{age} years</span>
                  <span style={{ fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--gradient-blue)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Gender Split */}
          <div className="demo-group-box">
            <div className="demo-group-title">
              <Heart size={14} color="#ec4899" /> Gender Split
            </div>
            {Object.entries(analytics?.audience_demographics?.gender || { 'Female': 55, 'Male': 45 }).map(([gender, pct]) => (
              <div key={gender} className="progress-item">
                <div className="progress-meta">
                  <span style={{ textTransform: 'capitalize' }}>{gender}</span>
                  <span style={{ fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: gender === 'female' || gender === 'Female' ? 'var(--gradient-creator)' : 'var(--gradient-blue)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top Locations */}
          <div className="demo-group-box">
            <div className="demo-group-title">
              <Sparkles size={14} color="#10b981" /> Top Countries
            </div>
            {Object.entries(analytics?.audience_demographics?.locations || { 'United States': 40, 'India': 25, 'United Kingdom': 20, 'Other': 15 }).map(([loc, pct]) => (
              <div key={loc} className="progress-item">
                <div className="progress-meta">
                  <span>{loc}</span>
                  <span style={{ fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--gradient-emerald)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Content & Social Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Top Content Table */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-heading">
              <Share2 size={18} color="#a855f7" />
              <span>Top Performing Content</span>
            </h3>
            <Link to="/content" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title & Platform</th>
                  <th style={{ textAlign: 'right' }}>Views</th>
                  <th style={{ textAlign: 'right' }}>Likes</th>
                  <th style={{ textAlign: 'right' }}>Eng. Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.top_content?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                      {getPlatformBadge(item.platform)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{item.views.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{item.likes.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="trend-badge trend-positive">
                        {item.engagement || '7.2'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connected Social Accounts */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-heading">
              <CheckCircle2 size={18} color="#10b981" />
              <span>Connected Social Channels</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status & Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {socialStatus.map((social) => (
              <div key={social.id || social.name} className="social-card">
                <div className="social-meta">
                  <div className="social-icon-box" style={{ background: social.name === 'YouTube' ? 'rgba(239,68,68,0.15)' : social.name === 'Instagram' ? 'rgba(236,72,153,0.15)' : social.name === 'TikTok' ? 'rgba(6,182,212,0.15)' : 'rgba(59,130,246,0.15)' }}>
                    {social.name === 'YouTube' && <Youtube size={20} color="#ef4444" />}
                    {social.name === 'Instagram' && <Instagram size={20} color="#ec4899" />}
                    {social.name === 'TikTok' && <Zap size={20} color="#06b6d4" />}
                    {social.name === 'Facebook' && <Share2 size={20} color="#3b82f6" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{social.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {social.connected ? social.username || '@creator' : 'Not Connected'}
                    </div>
                  </div>
                </div>

                <div>
                  {social.connected ? (
                    <span className="badge badge-admin" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={11} /> Connected
                    </span>
                  ) : (
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
