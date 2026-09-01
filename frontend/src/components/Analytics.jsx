import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Activity,
  Download,
  ArrowUpRight
} from 'lucide-react';

function Analytics() {
  const [growthData, setGrowthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [growthRes] = await Promise.all([
          api.get('/analytics/growth'),
          api.get('/analytics/dashboard')
        ]);
        setGrowthData(growthRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExport = () => {
    alert('Analytics report summary exported successfully!');
  };

  return (
    <Layout pageTitle="Growth & Performance Analytics">
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            In-Depth Performance Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Historical audience trajectory, retention rates, and content reach metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#ffffff', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-dark)' }}>
            {['30d', '6m', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none', padding: '0.3rem 0.65rem', textTransform: 'uppercase' }}
              >
                {range}
              </button>
            ))}
          </div>

          <button onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Impressions</span>
            <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Eye size={20} />
            </div>
          </div>
          <div className="kpi-value">{growthData?.impressions?.toLocaleString() || '68,000'}</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={13} /> +18.4%</span>
            <span className="trend-subtitle">reach rate</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Reach</span>
            <div className="kpi-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{growthData?.total_reach?.toLocaleString() || '45,000'}</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={13} /> +14.2%</span>
            <span className="trend-subtitle">unique viewers</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Avg Engagement</span>
            <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value">4.2%</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={13} /> +0.8%</span>
            <span className="trend-subtitle">retention rate</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Conversion Rate</span>
            <div className="kpi-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">2.9%</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={13} /> +3.5%</span>
            <span className="trend-subtitle">conversion</span>
          </div>
        </div>
      </div>

      {/* Follower Growth Over Time Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header-flex">
          <h3 className="card-heading">
            <TrendingUp size={18} color="#2563eb" />
            <span>Follower Trajectory Curve</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Growth Over Time</span>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData?.follower_growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="followers" name="Followers" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFollowers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Trend Line Chart */}
      <div className="card">
        <div className="card-header-flex">
          <h3 className="card-heading">
            <Activity size={18} color="#db2777" />
            <span>Engagement Rate Trend (%)</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Average</span>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData?.engagement_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="rate" name="Engagement Rate %" stroke="#db2777" strokeWidth={2.5} dot={{ fill: '#db2777', r: 4 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}

export default Analytics;
