import React, { useState, useEffect } from 'react';
import { FiSettings, FiShield, FiMail, FiDatabase, FiClock, FiRefreshCw } from 'react-icons/fi';
import API from '../api';

export default function SettingsPage() {
  const role = localStorage.getItem('role');
  const [tab, setTab] = useState('general');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/auth/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tab === 'audit') fetchAuditLogs(); }, [tab]);

  if (role !== 'Super_Admin') {
    return (
      <div className="animate-in">
        <div className="card empty-state" style={{ marginTop: '4rem' }}>
          <FiShield size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h3>Access Denied</h3>
          <p>System settings are only accessible to Super Admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="mb-6">
        <div className="page-label">System</div>
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Manage system configuration and view audit logs from the database.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>General</button>
        <button className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>Audit Logs</button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
      </div>

      {tab === 'general' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FiSettings size={16} /> General Settings</h3>
            <div className="flex-col gap-4">
              <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" defaultValue="FlashEMS Technologies" /></div>
              <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" defaultValue="admin@flashems.com" /></div>
              <div className="form-group"><label className="form-label">Default Leave Days</label><input type="number" className="form-input" defaultValue={12} /></div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => alert('Settings saved!')}>Save Settings</button>
            </div>
          </div>
          <div className="flex-col gap-6">
            <div className="card">
              <h3 className="font-bold mb-4 flex items-center gap-2"><FiDatabase size={16} /> Database</h3>
              <div className="flex-col gap-3">
                <div className="flex justify-between" style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-xs)' }}>
                  <span className="text-sm text-muted">Status</span><span className="badge badge-success">Connected</span>
                </div>
                <div className="flex justify-between" style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-xs)' }}>
                  <span className="text-sm text-muted">Host</span><span className="text-sm font-bold">MongoDB Atlas</span>
                </div>
                <div className="flex justify-between" style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-xs)' }}>
                  <span className="text-sm text-muted">Cluster</span><span className="text-sm font-bold">Cluster0</span>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="font-bold mb-4 flex items-center gap-2"><FiMail size={16} /> Email Configuration</h3>
              <div className="flex-col gap-3">
                <div className="form-group"><label className="form-label">SMTP Host</label><input className="form-input" defaultValue="smtp.gmail.com" /></div>
                <div className="form-group"><label className="form-label">SMTP Port</label><input className="form-input" defaultValue="587" /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'audit' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted">{auditLogs.length} log entries from database</span>
            <button className="btn btn-outline btn-sm" onClick={fetchAuditLogs} disabled={loading}><FiRefreshCw size={12} /> Refresh</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div className="flex justify-center py-10"><div className="spinner"></div></div>
            ) : auditLogs.length === 0 ? (
              <div className="empty-state py-10"><h3>No audit logs yet</h3><p className="text-sm text-muted">Actions like creating users, approving leaves, and generating payslips are logged here.</p></div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Action</th><th>Target</th><th>Details</th><th>Time</th></tr></thead>
                  <tbody>
                    {auditLogs.map((log, i) => (
                      <tr key={log._id || i}>
                        <td><span className={`badge ${log.action?.includes('DELETE') ? 'badge-danger' : log.action?.includes('CREATE') ? 'badge-success' : 'badge-info'}`}>{log.action}</span></td>
                        <td className="text-sm">{log.target}</td>
                        <td className="text-sm text-muted" style={{ maxWidth: '250px' }}>{log.details}</td>
                        <td className="text-sm text-muted flex items-center gap-1"><FiClock size={12} /> {new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2"><FiShield size={16} /> Security Settings</h3>
          <div className="flex-col gap-4">
            {[
              { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', enabled: false },
              { label: 'Session Timeout', desc: 'Auto-logout after 24 hours of inactivity', enabled: true },
              { label: 'IP Whitelist', desc: 'Restrict access to specific IP addresses', enabled: false },
              { label: 'Password Complexity', desc: 'Require min 8 chars, uppercase, number', enabled: true },
            ].map((setting, i) => (
              <div key={i} className="flex justify-between items-center" style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div className="text-sm font-bold">{setting.label}</div>
                  <div className="text-xs text-muted">{setting.desc}</div>
                </div>
                <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: setting.enabled ? 'var(--success)' : 'var(--border-light)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: setting.enabled ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
