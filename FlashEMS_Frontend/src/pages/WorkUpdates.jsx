import React, { useState, useEffect } from 'react';
import { FiPlus, FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import API from '../api';

export default function WorkUpdates() {
  const role = localStorage.getItem('role') || 'User';
  const name = localStorage.getItem('name') || 'User';
  const isAdmin = ['Super_Admin', 'HR_Manager'].includes(role);
  const [tab, setTab] = useState(isAdmin ? 'all' : 'submit');
  const [form, setForm] = useState({ title: '', description: '' });
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackId, setFeedbackId] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/work-updates/all' : '/work-updates/my';
      const res = await API.get(endpoint);
      setUpdates(res.data);
    } catch (err) {
      console.error('Failed to fetch work updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUpdates(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/work-updates', { ...form, date: new Date() });
      alert('Work update submitted successfully!');
      setForm({ title: '', description: '' });
      setTab(isAdmin ? 'all' : 'my');
      fetchUpdates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit update');
    }
  };

  const handleFeedback = async (id) => {
    try {
      await API.put(`/work-updates/${id}/feedback`, { feedback: feedbackText });
      alert('Feedback submitted!');
      setFeedbackText('');
      setFeedbackId(null);
      fetchUpdates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit feedback');
    }
  };

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="page-label">Work Updates</div>
          <h1 className="page-title">Daily Reports</h1>
          <p className="page-subtitle">{updates.length} updates in database</p>
        </div>
        <button className="btn btn-outline" onClick={fetchUpdates} disabled={loading}>
          <FiRefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="tabs">
        {!isAdmin && <button className={`tab ${tab === 'submit' ? 'active' : ''}`} onClick={() => setTab('submit')}>Submit Update</button>}
        {!isAdmin && <button className={`tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Updates ({updates.length})</button>}
        {isAdmin && <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Updates ({updates.length})</button>}
      </div>

      {tab === 'submit' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2"><FiPlus /> New Work Update</h3>
          <form onSubmit={handleSubmit}>
            <div className="flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Completed API endpoint" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what you worked on today..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <FiSend size={14} /> Submit Update
              </button>
            </div>
          </form>
        </div>
      )}

      {(tab === 'my' || tab === 'all') && (
        <div className="flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner"></div></div>
          ) : updates.length === 0 ? (
            <div className="card empty-state"><h3>No updates yet</h3><p>Submit your first work update.</p></div>
          ) : updates.map(u => (
            <div key={u._id} className="card">
              <div className="flex gap-3 items-start flex-1">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.employeeId?.name || name)}&background=random&size=40`} alt="" className="avatar" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold">{u.employeeId?.name || name}</span>
                      <span className="text-xs text-muted ml-2">• {u.employeeId?.department || ''}</span>
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1"><FiClock size={12} /> {new Date(u.date || u.createdAt).toLocaleDateString()}</div>
                  </div>
                  <h4 className="font-bold text-sm mt-2">{u.title}</h4>
                  <p className="text-sm text-muted mt-1">{u.description}</p>

                  {u.feedback && (
                    <div className="mt-3" style={{ padding: '0.75rem', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--success)' }}>
                      <div className="text-xs font-bold text-success flex items-center gap-1"><FiCheckCircle size={12} /> Feedback from {u.feedbackBy?.name || 'Manager'}</div>
                      <p className="text-sm mt-1">{u.feedback}</p>
                    </div>
                  )}

                  {isAdmin && !u.feedback && (
                    <div className="mt-3">
                      {feedbackId === u._id ? (
                        <div className="flex gap-2">
                          <input className="form-input flex-1" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Write feedback..." style={{ fontSize: '0.85rem' }} />
                          <button onClick={() => handleFeedback(u._id)} className="btn btn-success btn-sm" disabled={!feedbackText.trim()}><FiSend size={12} /></button>
                          <button onClick={() => { setFeedbackId(null); setFeedbackText(''); }} className="btn btn-outline btn-sm">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setFeedbackId(u._id)} className="btn btn-secondary btn-sm"><FiMessageSquare size={12} /> Give Feedback</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
