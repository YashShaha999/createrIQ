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
      <Layout pageTitle="Creator Analytics Dashboard">
        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div className="status-dot" style={{ width: '12px', height: '12px', margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Loading Dashboard Data...
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving latest performance metrics and statistics</p>
        </div>
      </Layout>
    );
  }

  if (error && !analytics) {
    return (
      <Layout pageTitle="Creator Analytics Dashboard">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '540px', margin: '2rem auto' }}>
          <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
            Connection Error
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{error}</p>
          <button onClick={fetchAllData} className="btn btn-primary">
            <RefreshCw size={15} />
            <span>Retry Connection</span>
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
    <Layout pageTitle="Overview Dashboard">
      {/* Header Welcome & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Welcome back, {user?.full_name || 'Creator'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Here is an overview of your social channel metrics, audience growth, and top performing posts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button 
            id="btn-refresh-dashboard"
            onClick={fetchAllData} 
            className="btn btn-secondary"
            disabled={refreshing}
          >
            <RefreshCw size={15} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          
          <Link to="/content" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <PlusCircle size={15} />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Views */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Views</span>
            <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Eye size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.total_views ? analytics.total_views.toLocaleString() : '125,430'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={13} /> +12.5%
              </span>
              <span className="trend-subtitle">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Likes</span>
            <div className="kpi-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <Heart size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.total_likes ? analytics.total_likes.toLocaleString() : '32,891'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={13} /> +8.3%
              </span>
              <span className="trend-subtitle">vs last month</span>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Engagement Rate</span>
            <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Zap size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.engagement_rate ? `${analytics.engagement_rate}%` : '4.2%'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={13} /> +2.1%
              </span>
              <span className="trend-subtitle">vs industry avg</span>
            </div>
          </div>
        </div>

        {/* Total Followers */}
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Followers</span>
            <div className="kpi-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{analytics?.total_followers ? analytics.total_followers.toLocaleString() : '8,234'}</div>
            <div className="kpi-bottom">
              <span className="trend-badge trend-positive">
                <ArrowUpRight size={13} /> +15.7%
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
              <TrendingUp size={18} color="#2563eb" />
              <span>Weekly Performance</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Views & Likes</span>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.weekly_performance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    borderColor: '#cbd5e1', 
                    borderRadius: '8px',
                    color: '#1e293b',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '13px' }} />
                <Bar dataKey="views" name="Views" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="likes" name="Likes" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution Pie Chart */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-heading">
              <Share2 size={18} color="#db2777" />
              <span>Platform Distribution</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audience Share</span>
          </div>

          <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    borderColor: '#cbd5e1', 
                    borderRadius: '8px',
                    color: '#1e293b',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
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
              <Users size={18} color="#16a34a" />
              <span>6-Month Follower Growth</span>
            </h3>
            <span className="trend-badge trend-positive">
              <ArrowUpRight size={13} /> +200% Total Gain
            </span>
          </div>

          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData.follower_growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    borderColor: '#cbd5e1', 
                    borderRadius: '8px',
                    color: '#1e293b',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="followers" name="Followers" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Audience Demographics */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header-flex">
          <h3 className="card-heading">
            <Users size={18} color="#0284c7" />
            <span>Audience Demographics</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Community Breakdown</span>
        </div>

        <div className="demographics-grid">
          {/* Age Groups */}
          <div className="demo-group-box">
            <div className="demo-group-title">
              <Zap size={14} color="#2563eb" /> Age Groups
            </div>
            {Object.entries(analytics?.audience_demographics?.age_groups || { '18-24': 35, '25-34': 40, '35-44': 15, '45+': 10 }).map(([age, pct]) => (
              <div key={age} className="progress-item">
                <div className="progress-meta">
                  <span>{age} years</span>
                  <span style={{ fontWeight: 600 }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: '#2563eb' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Gender Split */}
          <div className="demo-group-box">
            <div className="demo-group-title">
              <Heart size={14} color="#db2777" /> Gender Split
            </div>
            {Object.entries(analytics?.audience_demographics?.gender || { 'Female': 55, 'Male': 45 }).map(([gender, pct]) => (
              <div key={gender} className="progress-item">
                <div className="progress-meta">
                  <span style={{ textTransform: 'capitalize' }}>{gender}</span>
                  <span style={{ fontWeight: 600 }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: gender.toLowerCase() === 'female' ? '#db2777' : '#2563eb' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top Locations */}
          <div className="demo-group-box">
            <div className="demo-group-title">
              <TrendingUp size={14} color="#16a34a" /> Top Locations
            </div>
            {Object.entries(analytics?.audience_demographics?.locations || { 'United States': 40, 'India': 25, 'United Kingdom': 20, 'Other': 15 }).map(([loc, pct]) => (
              <div key={loc} className="progress-item">
                <div className="progress-meta">
                  <span>{loc}</span>
                  <span style={{ fontWeight: 600 }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: '#16a34a' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Content & Social Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Top Content Table */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-heading">
              <Share2 size={18} color="#2563eb" />
              <span>Top Performing Content</span>
            </h3>
            <Link to="/content" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
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
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{item.title}</div>
                      {getPlatformBadge(item.platform)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.views.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{item.likes.toLocaleString()}</td>
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
              <CheckCircle2 size={18} color="#16a34a" />
              <span>Connected Social Channels</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status & Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {socialStatus.map((social) => (
              <div key={social.id || social.name} className="social-card">
                <div className="social-meta">
                  <div className="social-icon-box" style={{ background: social.name === 'YouTube' ? '#fee2e2' : social.name === 'Instagram' ? '#fce7f3' : social.name === 'TikTok' ? '#e0f2fe' : '#dbeafe' }}>
                    {social.name === 'YouTube' && <Youtube size={18} color="#dc2626" />}
                    {social.name === 'Instagram' && <Instagram size={18} color="#db2777" />}
                    {social.name === 'TikTok' && <Zap size={18} color="#0284c7" />}
                    {social.name === 'Facebook' && <Share2 size={18} color="#2563eb" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{social.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {social.connected ? social.username || '@creator' : 'Not Connected'}
                    </div>
                  </div>
                </div>

                <div>
                  {social.connected ? (
                    <span className="badge badge-admin" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={11} /> Connected
                    </span>
                  ) : (
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
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
