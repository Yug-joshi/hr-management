import React, { useState, useEffect } from 'react';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiPlus } from 'react-icons/fi';
import API from '../api';

const TYPES = ['casual', 'sick', 'paid', 'unpaid'];

export default function LeaveManagement() {
  const role = localStorage.getItem('role') || 'User';
  const isAdmin = ['Super_Admin', 'HR_Manager'].includes(role);
  const [tab, setTab] = useState(isAdmin ? 'requests' : 'apply');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });
  const [balance] = useState({ casual: 12, sick: 10, paid: 15, unpaid: '∞' });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/leaves/all' : '/leaves/my';
      const res = await API.get(endpoint);
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leaves', form);
      alert('Leave request submitted successfully!');
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      setTab('history');
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit leave');
    }
  };

  const handleAction = async (id, status) => {
    try {
      await API.put(`/leaves/${id}`, { status });
      alert(`Leave ${status} successfully!`);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  const statusBadge = (status) => {
    const map = { approved: 'badge-success', pending: 'badge-warning', rejected: 'badge-danger' };
    const icons = { approved: <FiCheckCircle size={11} />, pending: <FiClock size={11} />, rejected: <FiXCircle size={11} /> };
    return <span className={`badge ${map[status]}`}>{icons[status]} {status}</span>;
  };

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="page-label">Leave Management</div>
          <h1 className="page-title">Time Off</h1>
        </div>
      </div>

      {/* Leave Balance Cards (Employee) */}
      {!isAdmin && (
        <div className="stats-grid mb-6">
          {TYPES.map(t => (
            <div key={t} className="stat-card">
              <div className="stat-label" style={{ textTransform: 'capitalize' }}>{t} Leave</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{balance[t]}</div>
              <div className="stat-change text-muted">days available</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {!isAdmin && <button className={`tab ${tab === 'apply' ? 'active' : ''}`} onClick={() => setTab('apply')}>Apply for Leave</button>}
        {!isAdmin && <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>My History ({leaves.length})</button>}
        {isAdmin && <button className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>Pending Requests ({pendingLeaves.length})</button>}
        {isAdmin && <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Leaves ({leaves.length})</button>}
      </div>

      {/* Apply Form */}
      {tab === 'apply' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 className="font-bold mb-4">New Leave Request</h3>
          <form onSubmit={handleApply}>
            <div className="flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea className="form-textarea" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Describe your reason for leave..." required></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <FiPlus size={16} /> Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History (Employee) */}
      {tab === 'history' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Applied</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8"><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-8">No leave records found. Apply for your first leave!</td></tr>
              ) : leaves.map(l => (
                <tr key={l._id}>
                  <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{l.type}</span></td>
                  <td className="text-sm">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="text-sm" style={{ maxWidth: '200px' }}>{l.reason}</td>
                  <td>{statusBadge(l.status)}</td>
                  <td className="text-sm text-muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Requests (Admin/HR) */}
      {tab === 'requests' && (
        <div className="flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner"></div></div>
          ) : pendingLeaves.length === 0 ? (
            <div className="card empty-state"><h3>No pending requests</h3><p>All leave requests have been reviewed.</p></div>
          ) : pendingLeaves.map(l => (
            <div key={l._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(l.employeeId?.name || 'User')}&background=random&size=40`} alt="" className="avatar" />
                  <div>
                    <div className="font-bold">{l.employeeId?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted">{l.employeeId?.department || ''} • {l.employeeId?.email || ''}</div>
                    <div className="mt-2 flex gap-2 items-center">
                      <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{l.type}</span>
                      <span className="text-sm">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted mt-2">"{l.reason}"</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(l._id, 'approved')} className="btn btn-success btn-sm"><FiCheckCircle size={14} /> Approve</button>
                  <button onClick={() => handleAction(l._id, 'rejected')} className="btn btn-danger btn-sm"><FiXCircle size={14} /> Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Leaves (Admin/HR) */}
      {tab === 'all' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Department</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8"><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-8">No leave records in database.</td></tr>
              ) : leaves.map(l => (
                <tr key={l._id}>
                  <td className="font-medium">{l.employeeId?.name || 'Unknown'}</td>
                  <td className="text-sm text-muted">{l.employeeId?.department || '—'}</td>
                  <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{l.type}</span></td>
                  <td className="text-sm">{new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}</td>
                  <td>{statusBadge(l.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
