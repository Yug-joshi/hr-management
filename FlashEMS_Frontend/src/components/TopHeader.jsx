import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiSettings, FiCheck } from 'react-icons/fi';
import API from '../api';

const TopHeader = () => {
  const location = useLocation();
  const name = localStorage.getItem('name') || 'User';
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  // Page titles
  const titles = {
    '/': 'Dashboard', '/leave': 'Leave Management', '/work-updates': 'Work Updates',
    '/performance': 'Performance', '/salary': 'Salary & Payslips', '/profile': 'My Profile',
    '/employees': 'Employee Management', '/payroll': 'Payroll System', '/analytics': 'Analytics',
    '/settings': 'System Settings',
  };
  const pageTitle = titles[location.pathname] || 'FlashEMS';

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <header className="top-header">
      <div className="flex items-center gap-4">
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{pageTitle}</h2>
      </div>
      <div className="header-actions">
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setShowNotifs(!showNotifs)}>
            <FiBell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </div>
          {showNotifs && (
            <div className="notif-dropdown">
              <div className="flex justify-between items-center" style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <span className="font-bold text-sm">Notifications</span>
                <button onClick={() => { setNotifs(notifs.map(n => ({ ...n, read: true }))); }} className="btn btn-sm btn-secondary" style={{ gap: '0.25rem' }}>
                  <FiCheck size={12} /> Mark all read
                </button>
              </div>
              {notifs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notifications yet</div>
              ) : (
                notifs.slice(0, 10).map((n, i) => (
                  <div key={i} className="flex gap-3 items-start" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)', background: n.read ? 'transparent' : 'var(--primary-light)' }}>
                    <div className="flex-1">
                      <div className="text-sm" style={{ fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
                      <div className="text-xs text-muted mt-1">{n.type}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <FiSettings size={20} onClick={() => alert('Settings')} style={{ cursor: 'pointer' }} />
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2b3bf7&color=fff&size=34`} alt="User" className="avatar" style={{ cursor: 'pointer' }} />
        <span className="text-sm font-medium" style={{ maxWidth: '120px' }}>{name}</span>
      </div>
    </header>
  );
};

export default TopHeader;
