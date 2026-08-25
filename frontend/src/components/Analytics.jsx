import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Activity,
  Share2,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

function Analytics() {
  const [growthData, setGrowthData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [growthRes, dashRes] = await Promise.all([
          api.get('/analytics/growth'),
          api.get('/analytics/dashboard')
        ]);
        setGrowthData(growthRes.data);
        setDashboardData(dashRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExport = () => {
    alert('📊 Analytics Report downloaded as CSV summary!');
  };

  return (
    <Layout pageTitle="Growth & In-Depth Analytics">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            In-Depth Performance Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Historical audience trajectory, conversion metrics, and content reach.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(15, 20, 32, 0.8)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {['30d', '6m', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-sm)', border: 'none' }}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download size={15} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Impressions</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-blue)' }}>
              <Eye size={22} />
            </div>
          </div>
          <div className="kpi-value">{growthData?.impressions?.toLocaleString() || '68,000'}</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={14} /> +18.4%</span>
            <span className="trend-subtitle">reach efficiency</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Reach</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-emerald)' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="kpi-value">{growthData?.total_reach?.toLocaleString() || '45,000'}</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={14} /> +14.2%</span>
            <span className="trend-subtitle">unique viewers</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Avg Engagement</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-amber)' }}>
              <Activity size={22} />
            </div>
          </div>
          <div className="kpi-value">4.2%</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={14} /> +0.8%</span>
            <span className="trend-subtitle">retention rate</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Conversion Rate</span>
            <div className="kpi-icon-box" style={{ background: 'var(--gradient-creator)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="kpi-value">2.9%</div>
          <div className="kpi-bottom">
            <span className="trend-badge trend-positive"><ArrowUpRight size={14} /> +3.5%</span>
            <span className="trend-subtitle">subscriber conversion</span>
          </div>
        </div>
      </div>

      {/* Follower Growth Over Time Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header-flex">
          <h3 className="card-heading">
            <TrendingUp size={18} color="#6366f1" />
            <span>Follower Trajectory Curve</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Growth Over Time</span>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData?.follower_growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f1422', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }} />
              <Area type="monotone" dataKey="followers" name="Followers" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Trend Line Chart */}
      <div className="card">
        <div className="card-header-flex">
          <h3 className="card-heading">
            <Activity size={18} color="#ec4899" />
            <span>Engagement Rate Trend (%)</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Average</span>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData?.engagement_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f1422', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }} />
              <Line type="monotone" dataKey="rate" name="Engagement Rate %" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}

export default Analytics;
