import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from '../api';
import {
  FileText,
  PlusCircle,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function Content() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  // Form State
  const [form, setForm] = useState({
    title: '',
    platform: 'youtube',
    views: 1000,
    likes: 120,
    comments: 25,
    shares: 10
  });

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/content');
      setContents(res.data.contents || []);
    } catch (err) {
      console.error('Failed to load content list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const viewsNum = parseInt(form.views) || 0;
      const likesNum = parseInt(form.likes) || 0;
      const commentsNum = parseInt(form.comments) || 0;
      const sharesNum = parseInt(form.shares) || 0;
      
      const calculatedEngRate = viewsNum > 0 
        ? parseFloat((((likesNum + commentsNum + sharesNum) / viewsNum) * 100).toFixed(2))
        : 0;

      const payload = {
        title: form.title,
        platform: form.platform,
        views: viewsNum,
        likes: likesNum,
        comments: commentsNum,
        shares: sharesNum,
        engagement_rate: calculatedEngRate
      };

      const res = await api.post('/content', payload);
      if (res.data?.success) {
        setStatusMsg({ text: 'Content post saved successfully!', type: 'success' });
        setForm({ title: '', platform: 'youtube', views: 1000, likes: 120, comments: 25, shares: 10 });
        setModalOpen(false);
        fetchContents();
      }
    } catch (err) {
      setStatusMsg({ text: err.response?.data?.detail || 'Failed to save content.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content record?')) return;
    try {
      await api.delete(`/content/${id}`);
      setContents(contents.filter((c) => c.id !== id && c._id !== id));
      setStatusMsg({ text: 'Content record deleted.', type: 'success' });
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const filteredContents = contents.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || item.platform?.toLowerCase() === platformFilter.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

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
    <Layout pageTitle="Content Management">
      {/* Header & New Content Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Content Library & Records
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage and monitor your published videos, posts, and engagement metrics.
          </p>
        </div>

        <button 
          id="btn-open-create-content"
          onClick={() => setModalOpen(true)} 
          className="btn btn-primary"
        >
          <PlusCircle size={16} />
          <span>Add New Post</span>
        </button>
      </div>

      {/* Notifications */}
      {statusMsg.text && (
        <div className={`alert alert-${statusMsg.type}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search content by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Platform Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['all', 'youtube', 'instagram', 'tiktok', 'facebook'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`btn btn-sm ${platformFilter === p ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Table Card */}
      <div className="card">
        <div className="card-header-flex">
          <h3 className="card-heading">
            <FileText size={18} color="#2563eb" />
            <span>Published Posts ({filteredContents.length})</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest records</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading content records...
          </div>
        ) : filteredContents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <FileText size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>No content posts found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Click "Add New Post" to log your first content record.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Platform</th>
                  <th style={{ textAlign: 'right' }}>Views</th>
                  <th style={{ textAlign: 'right' }}>Likes</th>
                  <th style={{ textAlign: 'right' }}>Comments</th>
                  <th style={{ textAlign: 'right' }}>Shares</th>
                  <th style={{ textAlign: 'right' }}>Engagement</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.map((item) => (
                  <tr key={item.id || item._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </td>
                    <td>{getPlatformBadge(item.platform)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.views?.toLocaleString() || 0}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{item.likes?.toLocaleString() || 0}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{item.comments?.toLocaleString() || 0}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{item.shares?.toLocaleString() || 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="trend-badge trend-positive">
                        {item.engagement_rate ? `${item.engagement_rate}%` : '6.5%'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(item.id || item._id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.55rem' }}
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Add Content */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#2563eb" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Add New Content Post
                </h2>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Post Title</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '0.85rem' }}
                  placeholder="e.g. 10 Tips for Modern Web Development"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Platform Channel</label>
                <select
                  className="form-select"
                  style={{ paddingLeft: '0.85rem' }}
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Views</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ paddingLeft: '0.85rem' }}
                    value={form.views}
                    onChange={(e) => setForm({ ...form, views: e.target.value })}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Likes</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ paddingLeft: '0.85rem' }}
                    value={form.likes}
                    onChange={(e) => setForm({ ...form, likes: e.target.value })}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Comments</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ paddingLeft: '0.85rem' }}
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Shares</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ paddingLeft: '0.85rem' }}
                    value={form.shares}
                    onChange={(e) => setForm({ ...form, shares: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Content;
