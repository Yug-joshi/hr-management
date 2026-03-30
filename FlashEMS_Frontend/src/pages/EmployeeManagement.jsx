import React, { useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiRefreshCw } from 'react-icons/fi';
import API from '../api';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'HR', 'Finance', 'Sales'];
const ROLES = ['User', 'HR_Manager', 'Super_Admin'];

export default function EmployeeManagement() {
  const role = localStorage.getItem('role') || 'User';
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: 'Engineering', designation: '', role: 'User', basicSalary: 30000, password: 'employee123' });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDept) params.department = filterDept;
      const res = await API.get('/auth/employees', { params });
      setEmployees(res.data);
      setLoaded(true);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  React.useEffect(() => { fetchEmployees(); }, []);

  // Re-fetch when search/filter changes
  React.useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(), 300);
    return () => clearTimeout(timer);
  }, [search, filterDept]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/auth/employee/${editingId}`, form);
        alert('Employee updated successfully!');
      } else {
        await API.post('/auth/signup', form);
        alert('Employee created successfully!');
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', email: '', phone: '', department: 'Engineering', designation: '', role: 'User', basicSalary: 30000, password: 'employee123' });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (emp) => {
    setForm({ name: emp.name, email: emp.email, phone: emp.phone || '', department: emp.department, designation: emp.designation || '', role: emp.role, basicSalary: emp.basicSalary || 30000, password: '' });
    setEditingId(emp._id);
    setShowModal(true);
  };

  const handleDelete = async (id, empName) => {
    if (!window.confirm(`Delete ${empName}? This action cannot be undone.`)) return;
    try {
      await API.delete(`/auth/employee/${id}`);
      alert('Employee deleted.');
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="page-label">Administration</div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">{employees.length} employees in database</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={fetchEmployees} disabled={loading}>
            <FiRefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ name: '', email: '', phone: '', department: 'Engineering', designation: '', role: 'User', basicSalary: 30000, password: 'employee123' }); setShowModal(true); }}>
            <FiUserPlus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1" style={{ background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0 1rem' }}>
          <FiSearch size={16} style={{ color: 'var(--text-light)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ border: 'none', outline: 'none', padding: '0.7rem 0', flex: 1, background: 'transparent' }} />
        </div>
        <select className="form-select" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: '200px' }}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && !loaded ? (
          <div className="flex justify-center items-center py-10"><div className="spinner"></div><span className="text-sm text-muted ml-3">Loading from database...</span></div>
        ) : employees.length === 0 ? (
          <div className="empty-state py-10">
            <h3>No employees found</h3>
            <p className="text-sm text-muted">Click "Add Employee" to create the first employee in your database.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Designation</th><th>Role</th><th>Salary</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&size=36`} alt="" className="avatar" />
                        <div>
                          <div className="font-medium text-sm">{emp.name}</div>
                          <div className="text-xs text-muted">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{emp.department || 'General'}</span></td>
                    <td className="text-sm">{emp.designation || '—'}</td>
                    <td><span className={`badge ${emp.role === 'Super_Admin' ? 'badge-danger' : emp.role === 'HR_Manager' ? 'badge-info' : 'badge-success'}`}>{emp.role.replace(/_/g, ' ')}</span></td>
                    <td className="font-medium">₹{(emp.basicSalary || 0).toLocaleString()}</td>
                    <td className="text-sm text-muted">{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon" onClick={() => handleEdit(emp)} title="Edit"><FiEdit2 size={14} /></button>
                        {(role === 'Super_Admin' || emp.role !== 'Super_Admin') && (
                          <button className="btn-icon" onClick={() => handleDelete(emp._id, emp.name)} title="Delete" style={{ color: 'var(--danger)' }}><FiTrash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="flex-col gap-4">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                  <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={!!editingId} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Designation</label><input className="form-input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                      {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Basic Salary (₹)</label><input type="number" className="form-input" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: parseInt(e.target.value) || 0 })} /></div>
                  {!editingId && <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 characters" /></div>}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Employee</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
