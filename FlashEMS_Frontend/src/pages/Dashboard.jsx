import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp, FiFileText, FiClipboard, FiArrowUpRight, FiClock, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../api';

const COLORS = ['#2b3bf7', '#6e6bfa', '#1fe5ff', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'User';
  const name = localStorage.getItem('name') || 'User';
  const isAdmin = ['Super_Admin', 'HR_Manager'].includes(role);
  const [dbStats, setDbStats] = useState({ totalEmployees: 0, departments: [], roles: [] });
  const [leaveStats, setLeaveStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [salaryStats, setSalaryStats] = useState({ totalPaid: 0, currentMonthTotal: 0, totalPayslips: 0 });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [statsRes, leaveRes, salaryRes] = await Promise.all([
          API.get('/auth/stats').catch(() => ({ data: { totalEmployees: 0, departments: [], roles: [] } })),
          API.get('/leaves/stats').catch(() => ({ data: { pending: 0, approved: 0, rejected: 0, total: 0 } })),
          API.get('/salary/stats').catch(() => ({ data: { totalPaid: 0, currentMonthTotal: 0, totalPayslips: 0 } })),
        ]);
        setDbStats(statsRes.data);
        setLeaveStats(leaveRes.data);
        setSalaryStats(salaryRes.data);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const stats = isAdmin ? [
    { icon: <FiUsers />, label: 'Total Employees', value: String(dbStats.totalEmployees), change: 'From database', color: '#2b3bf7', bg: '#eceeff' },
    { icon: <FiCalendar />, label: 'Pending Leaves', value: String(leaveStats.pending), change: `${leaveStats.total} total`, color: '#f59e0b', bg: '#fef3c7' },
    { icon: <FiDollarSign />, label: 'Payroll This Month', value: `₹${(salaryStats.currentMonthTotal / 100000).toFixed(1)}L`, change: `${salaryStats.totalPayslips} payslips`, color: '#10b981', bg: '#d1fae5' },
    { icon: <FiTrendingUp />, label: 'All-Time Payroll', value: `₹${(salaryStats.totalPaid / 100000).toFixed(1)}L`, change: 'Total paid', color: '#6e6bfa', bg: '#f0effe' },
  ] : [
    { icon: <FiCalendar />, label: 'Leave Balance', value: '27', change: 'Days remaining', color: '#2b3bf7', bg: '#eceeff' },
    { icon: <FiClipboard />, label: 'Work Updates', value: '—', change: 'Check module', color: '#10b981', bg: '#d1fae5' },
    { icon: <FiTrendingUp />, label: 'Performance', value: '—', change: 'Check module', color: '#6e6bfa', bg: '#f0effe' },
    { icon: <FiDollarSign />, label: 'Salary', value: '—', change: 'Check payslips', color: '#f59e0b', bg: '#fef3c7' },
  ];

  const quickActions = isAdmin ? [
    { icon: <FiUsers />, title: 'Manage Employees', desc: 'Add, edit, or remove staff', path: '/employees' },
    { icon: <FiFileText />, title: 'Run Payroll', desc: 'Generate monthly payslips', path: '/payroll' },
    { icon: <FiCalendar />, title: 'Leave Requests', desc: `${leaveStats.pending} pending approvals`, path: '/leave' },
    { icon: <FiTrendingUp />, title: 'Performance Reviews', desc: 'Evaluate team KPIs', path: '/performance' },
  ] : [
    { icon: <FiCalendar />, title: 'Apply for Leave', desc: 'Request time off', path: '/leave' },
    { icon: <FiClipboard />, title: 'Submit Update', desc: 'Daily work report', path: '/work-updates' },
    { icon: <FiDollarSign />, title: 'View Payslips', desc: 'Salary & tax details', path: '/salary' },
    { icon: <FiTrendingUp />, title: 'My Performance', desc: 'KPIs and feedback', path: '/performance' },
  ];

  // Department chart from real data
  const deptChartData = dbStats.departments?.map(d => ({ name: d._id || 'General', count: d.count })) || [];

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end">
        <div>
          <div className="page-label">Dashboard</div>
          <h1 className="page-title">Welcome back, <span className="text-primary">{name}</span></h1>
          <p className="page-subtitle">{isAdmin ? 'Real-time data from your MongoDB database.' : 'Here\'s your personal dashboard overview.'}</p>
        </div>
        {isAdmin && <button className="btn btn-outline" onClick={fetchDashboardData} disabled={loading}><FiRefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh</button>}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mt-6">
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change" style={{ color: s.color }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="font-bold text-lg mt-8 mb-4">Quick Actions</h2>
      <div className="grid-4">
        {quickActions.map((a, i) => (
          <div key={i} className="card" onClick={() => navigate(a.path)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="flex justify-between items-center">
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.icon}</div>
              <FiArrowUpRight size={16} style={{ color: 'var(--text-light)' }} />
            </div>
            <div>
              <div className="font-bold text-sm">{a.title}</div>
              <div className="text-xs text-muted mt-1">{a.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts (Admin/HR only) — from real DB data */}
      {isAdmin && deptChartData.length > 0 && (
        <div className="grid-2 mt-8">
          <div className="card">
            <h3 className="font-bold text-sm mb-4">Employees per Department (from DB)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2b3bf7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-bold text-sm mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptChartData} cx="50%" cy="50%" outerRadius={80} dataKey="count" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {deptChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Leave Summary */}
      {isAdmin && leaveStats.total > 0 && (
        <div className="card mt-6">
          <h3 className="font-bold text-sm mb-4">Leave Overview (from DB)</h3>
          <div className="grid-4">
            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div className="text-2xl font-bold">{leaveStats.total}</div><div className="text-xs text-muted">Total Leaves</div>
            </div>
            <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{leaveStats.pending}</div><div className="text-xs text-muted">Pending</div>
            </div>
            <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{leaveStats.approved}</div><div className="text-xs text-muted">Approved</div>
            </div>
            <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>{leaveStats.rejected}</div><div className="text-xs text-muted">Rejected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
