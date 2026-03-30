import React, { useState, useEffect } from 'react';
import { FiStar, FiTarget, FiTrendingUp, FiPlus, FiUser, FiRefreshCw } from 'react-icons/fi';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import API from '../api';

export default function PerformancePage() {
  const role = localStorage.getItem('role') || 'User';
  const isAdmin = ['Super_Admin', 'HR_Manager'].includes(role);
  const [tab, setTab] = useState(isAdmin ? 'overview' : 'my');
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evalForm, setEvalForm] = useState({ employeeId: '', period: 'Q1 2026', rating: 4, feedback: '', kpi1: 80, kpi2: 75, kpi3: 90 });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/performance/all' : '/performance/my';
      const res = await API.get(endpoint);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try {
      const res = await API.get('/auth/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => { fetchReviews(); fetchEmployees(); }, []);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeId: evalForm.employeeId,
        period: evalForm.period,
        rating: evalForm.rating,
        feedback: evalForm.feedback,
        kpis: [
          { name: 'Delivery', target: 100, achieved: evalForm.kpi1 },
          { name: 'Quality', target: 100, achieved: evalForm.kpi2 },
          { name: 'Innovation', target: 100, achieved: evalForm.kpi3 },
        ]
      };
      await API.post('/performance', payload);
      alert('Performance review submitted and saved to database!');
      setShowModal(false);
      setEvalForm({ employeeId: '', period: 'Q1 2026', rating: 4, feedback: '', kpi1: 80, kpi2: 75, kpi3: 90 });
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <FiStar key={i} size={14} fill={i < Math.round(rating) ? '#f59e0b' : 'none'} color={i < Math.round(rating) ? '#f59e0b' : '#d1d5db'} />
  ));

  // Build chart data from actual reviews
  const ratingData = reviews.slice(0, 5).reverse().map(r => ({ name: r.period, rating: r.rating }));
  const radarData = reviews[0]?.kpis?.map(k => ({ subject: k.name, A: k.achieved })) ||
    [{ subject: 'Delivery', A: 0 }, { subject: 'Quality', A: 0 }, { subject: 'Innovation', A: 0 }];

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="page-label">Performance</div>
          <h1 className="page-title">Performance Evaluation</h1>
          <p className="page-subtitle">{reviews.length} reviews in database</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={fetchReviews} disabled={loading}><FiRefreshCw size={14} /> Refresh</button>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus size={16} /> New Review</button>}
        </div>
      </div>

      <div className="tabs">
        {!isAdmin && <button className={`tab ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>My Performance</button>}
        {isAdmin && <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Team Overview</button>}
        {isAdmin && <button className={`tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>All Reviews ({reviews.length})</button>}
      </div>

      {/* Employee View - Charts from real data */}
      {tab === 'my' && reviews.length > 0 && (
        <div className="grid-2 mb-6">
          <div className="card flex-col items-center">
            <h3 className="font-bold text-sm mb-4">Latest Skill Matrix</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="A" stroke="#2b3bf7" fill="#2b3bf7" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-bold text-sm mb-4">Rating History</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="rating" fill="#2b3bf7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Admin Overview Stats */}
      {tab === 'overview' && (
        <div className="stats-grid mb-6">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eceeff', color: '#2b3bf7' }}><FiTarget /></div>
            <div className="stat-value">{reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '—'}</div>
            <div className="stat-label">Team Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><FiTrendingUp /></div>
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Reviews Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><FiStar /></div>
            <div className="stat-value">{reviews.filter(r => r.rating >= 4).length}</div>
            <div className="stat-label">Top Performers (4+)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><FiUser /></div>
            <div className="stat-value">{reviews.filter(r => r.rating < 3).length}</div>
            <div className="stat-label">Needs Improvement (&lt;3)</div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {(tab === 'reviews' || tab === 'overview' || tab === 'my') && (
        <div className="flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner"></div></div>
          ) : reviews.length === 0 ? (
            <div className="card empty-state">
              <h3>No performance reviews yet</h3>
              <p className="text-sm text-muted">{isAdmin ? 'Click "New Review" to create the first performance review.' : 'Your performance reviews will appear here once submitted by HR.'}</p>
            </div>
          ) : reviews.map(r => (
            <div key={r._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.employeeId?.name || 'User')}&background=random&size=40`} alt="" className="avatar" />
                  <div>
                    <div className="font-bold">{r.employeeId?.name || 'Employee'} <span className="text-xs text-muted">• {r.employeeId?.department || ''}</span></div>
                    <div className="text-xs text-muted">Period: {r.period} • Evaluated by: {r.evaluatedBy?.name || 'Admin'}</div>
                    <div className="flex items-center gap-1 mt-2">{renderStars(r.rating)} <span className="text-sm font-bold ml-1">{r.rating}/5</span></div>
                    <p className="text-sm text-muted mt-2">"{r.feedback}"</p>
                    {r.kpis && r.kpis.length > 0 && (
                      <div className="flex gap-4 mt-3">
                        {r.kpis.map((k, i) => (
                          <div key={i}>
                            <div className="text-xs text-muted">{k.name}</div>
                            <div className="flex items-center gap-2">
                              <div className="progress-container" style={{ width: '80px' }}><div className="progress-fill" style={{ width: `${k.achieved}%` }}></div></div>
                              <span className="text-xs font-bold">{k.achieved}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="badge badge-info">{r.period}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evaluate Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Performance Review</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleEvaluate}>
              <div className="flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Select Employee</label>
                  <select className="form-select" value={evalForm.employeeId} onChange={e => setEvalForm({ ...evalForm, employeeId: e.target.value })} required>
                    <option value="">— Select an employee —</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Period</label>
                    <select className="form-select" value={evalForm.period} onChange={e => setEvalForm({ ...evalForm, period: e.target.value })}>
                      <option>Q1 2026</option><option>Q2 2026</option><option>Q3 2026</option><option>Q4 2026</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating (1-5)</label>
                    <input type="number" min="1" max="5" step="0.1" className="form-input" value={evalForm.rating} onChange={e => setEvalForm({ ...evalForm, rating: parseFloat(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">KPIs (% achieved)</label>
                  <div className="grid-3" style={{ gap: '0.75rem' }}>
                    <div className="form-group"><label className="form-label" style={{ fontSize: '0.65rem' }}>Delivery</label><input type="number" className="form-input" value={evalForm.kpi1} onChange={e => setEvalForm({ ...evalForm, kpi1: parseInt(e.target.value) || 0 })} /></div>
                    <div className="form-group"><label className="form-label" style={{ fontSize: '0.65rem' }}>Quality</label><input type="number" className="form-input" value={evalForm.kpi2} onChange={e => setEvalForm({ ...evalForm, kpi2: parseInt(e.target.value) || 0 })} /></div>
                    <div className="form-group"><label className="form-label" style={{ fontSize: '0.65rem' }}>Innovation</label><input type="number" className="form-input" value={evalForm.kpi3} onChange={e => setEvalForm({ ...evalForm, kpi3: parseInt(e.target.value) || 0 })} /></div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Feedback</label>
                  <textarea className="form-textarea" value={evalForm.feedback} onChange={e => setEvalForm({ ...evalForm, feedback: e.target.value })} required placeholder="Write your assessment..." />
                </div>
                <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Review</button></div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
