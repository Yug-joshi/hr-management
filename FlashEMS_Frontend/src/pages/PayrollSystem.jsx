import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload, FiFileText, FiUsers, FiPlus, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../api';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#2b3bf7', '#10b981', '#f59e0b', '#ef4444', '#6e6bfa'];

export default function PayrollSystem() {
  const [tab, setTab] = useState('overview');
  const [showGenerate, setShowGenerate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalPaid: 0, currentMonthTotal: 0, totalPayslips: 0 });
  const [genForm, setGenForm] = useState({ employeeId: '', basic: 40000, hra: 16000, bonus: 0, deductions: 2000, tax: 4000, month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [bulkForm, setBulkForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const [salariesRes, statsRes, empRes] = await Promise.all([
        API.get('/salary/all'),
        API.get('/salary/stats'),
        API.get('/auth/employees')
      ]);
      setPayrollRecords(salariesRes.data);
      setStats(statsRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/salary/generate', genForm);
      alert('Payslip generated and saved to database!');
      setShowGenerate(false);
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate payslip');
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/salary/generate-bulk', bulkForm);
      alert(res.data.message || 'Bulk payslips generated!');
      setShowBulk(false);
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || 'Bulk generation failed');
    }
  };

  const exportCSV = () => {
    if (payrollRecords.length === 0) return alert('No records to export');
    const header = 'Name,Department,Basic,HRA,Bonus,Deductions,Tax,Net Pay,Month,Year\n';
    const rows = payrollRecords.map(r => `${r.employeeId?.name || ''},${r.employeeId?.department || ''},${r.basic},${r.hra},${r.bonus},${r.deductions},${r.tax},${r.netPay},${r.month},${r.year}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payroll_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Aggregate data for charts
  const totalPayroll = payrollRecords.reduce((a, r) => a + r.netPay, 0);
  const totalBonus = payrollRecords.reduce((a, r) => a + r.bonus, 0);
  const deptData = Object.entries(payrollRecords.reduce((acc, r) => {
    const dept = r.employeeId?.department || 'General';
    return { ...acc, [dept]: (acc[dept] || 0) + r.netPay };
  }, {})).map(([name, value]) => ({ name, value: Math.round(value / 1000) }));

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="page-label">Administration</div>
          <h1 className="page-title">Payroll System</h1>
          <p className="page-subtitle">{payrollRecords.length} payslips in database</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={fetchPayroll} disabled={loading}><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn btn-outline" onClick={exportCSV}><FiDownload size={14} /> Export CSV</button>
          <button className="btn btn-secondary" onClick={() => setShowBulk(true)}><FiUsers size={14} /> Bulk Generate</button>
          <button className="btn btn-primary" onClick={() => setShowGenerate(true)}><FiPlus size={14} /> Single Payslip</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eceeff', color: '#2b3bf7' }}><FiDollarSign /></div>
          <div className="stat-value">₹{(stats.currentMonthTotal / 100000).toFixed(1)}L</div>
          <div className="stat-label">This Month's Payroll</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><FiUsers /></div>
          <div className="stat-value">{stats.totalPayslips}</div>
          <div className="stat-label">Total Payslips</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><FiFileText /></div>
          <div className="stat-value">₹{totalBonus.toLocaleString()}</div>
          <div className="stat-label">Total Bonuses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><FiCheckCircle /></div>
          <div className="stat-value">₹{(stats.totalPaid / 100000).toFixed(1)}L</div>
          <div className="stat-label">All-Time Payroll</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>All Records ({payrollRecords.length})</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="spinner"></div></div>
      ) : tab === 'overview' ? (
        payrollRecords.length === 0 ? (
          <div className="card empty-state"><h3>No payroll records</h3><p className="text-sm text-muted">Generate your first payslip using "Single Payslip" or "Bulk Generate".</p></div>
        ) : (
          <div className="grid-2">
            <div className="card">
              <h3 className="font-bold text-sm mb-4">Net Pay Distribution (₹K)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={payrollRecords.slice(0, 10).map(r => ({ name: r.employeeId?.name?.split(' ')[0] || '?', net: Math.round(r.netPay / 1000) }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `₹${v}K`} />
                  <Bar dataKey="net" fill="#2b3bf7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="font-bold text-sm mb-4">Payroll by Department (₹K)</h3>
              {deptData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ₹${value}K`}>
                      {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="text-sm text-muted text-center py-10">No department data yet</div>}
            </div>
          </div>
        )
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Department</th><th>Period</th><th>Basic</th><th>HRA</th><th>Bonus</th><th>Deductions</th><th>Tax</th><th>Net Pay</th></tr></thead>
              <tbody>
                {payrollRecords.length === 0 ? (
                  <tr><td colSpan="9" className="text-center text-muted py-8">No payroll records in database.</td></tr>
                ) : payrollRecords.map(r => (
                  <tr key={r._id}>
                    <td className="font-medium">{r.employeeId?.name || 'Unknown'}</td>
                    <td><span className="badge badge-neutral">{r.employeeId?.department || 'General'}</span></td>
                    <td className="text-sm">{monthNames[r.month - 1]} {r.year}</td>
                    <td>₹{r.basic.toLocaleString()}</td>
                    <td>₹{r.hra.toLocaleString()}</td>
                    <td className={r.bonus > 0 ? 'text-success font-bold' : ''}>₹{r.bonus.toLocaleString()}</td>
                    <td className="text-danger">-₹{r.deductions.toLocaleString()}</td>
                    <td className="text-danger">-₹{r.tax.toLocaleString()}</td>
                    <td className="font-bold">₹{r.netPay.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Single Payslip Modal */}
      {showGenerate && (
        <div className="modal-overlay" onClick={() => setShowGenerate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Generate Payslip</h2><button className="modal-close" onClick={() => setShowGenerate(false)}>×</button></div>
            <form onSubmit={handleGenerate}>
              <div className="flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Select Employee</label>
                  <select className="form-select" value={genForm.employeeId} onChange={e => {
                    const emp = employees.find(em => em._id === e.target.value);
                    if (emp) {
                      const basic = emp.basicSalary || 30000;
                      setGenForm({ ...genForm, employeeId: e.target.value, basic, hra: Math.round(basic * 0.4), deductions: Math.round(basic * 0.05), tax: Math.round(basic * 0.1) });
                    } else {
                      setGenForm({ ...genForm, employeeId: e.target.value });
                    }
                  }} required>
                    <option value="">— Select Employee —</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} — ₹{emp.basicSalary?.toLocaleString() || '30,000'}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Month</label><select className="form-select" value={genForm.month} onChange={e => setGenForm({ ...genForm, month: parseInt(e.target.value) })}>{monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Year</label><input type="number" className="form-input" value={genForm.year} onChange={e => setGenForm({ ...genForm, year: parseInt(e.target.value) })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Basic (₹)</label><input type="number" className="form-input" value={genForm.basic} onChange={e => setGenForm({ ...genForm, basic: parseInt(e.target.value) || 0 })} /></div>
                  <div className="form-group"><label className="form-label">HRA (₹)</label><input type="number" className="form-input" value={genForm.hra} onChange={e => setGenForm({ ...genForm, hra: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Bonus (₹)</label><input type="number" className="form-input" value={genForm.bonus} onChange={e => setGenForm({ ...genForm, bonus: parseInt(e.target.value) || 0 })} /></div>
                  <div className="form-group"><label className="form-label">Deductions (₹)</label><input type="number" className="form-input" value={genForm.deductions} onChange={e => setGenForm({ ...genForm, deductions: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Tax (₹)</label><input type="number" className="form-input" value={genForm.tax} onChange={e => setGenForm({ ...genForm, tax: parseInt(e.target.value) || 0 })} /></div>
                <div style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                  <span className="text-sm">Net Pay: </span>
                  <span className="font-bold text-primary text-lg">₹{(genForm.basic + genForm.hra + genForm.bonus - genForm.deductions - genForm.tax).toLocaleString()}</span>
                </div>
                <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => setShowGenerate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Generate & Save</button></div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulk && (
        <div className="modal-overlay" onClick={() => setShowBulk(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h2 className="modal-title">Bulk Generate Payslips</h2><button className="modal-close" onClick={() => setShowBulk(false)}>×</button></div>
            <p className="text-sm text-muted mb-4">This will auto-generate payslips for all employees based on their base salary. Existing payslips for the same month will be skipped.</p>
            <form onSubmit={handleBulkGenerate}>
              <div className="flex-col gap-4">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Month</label><select className="form-select" value={bulkForm.month} onChange={e => setBulkForm({ ...bulkForm, month: parseInt(e.target.value) })}>{monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Year</label><input type="number" className="form-input" value={bulkForm.year} onChange={e => setBulkForm({ ...bulkForm, year: parseInt(e.target.value) })} /></div>
                </div>
                <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => setShowBulk(false)}>Cancel</button><button type="submit" className="btn btn-primary"><FiUsers size={14} /> Generate for All Employees</button></div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
