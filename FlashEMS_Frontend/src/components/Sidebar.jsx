import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiUsers, FiDollarSign, FiCalendar, FiFileText, FiSettings, FiHelpCircle, FiLogOut, FiUser, FiClipboard, FiBarChart2 } from 'react-icons/fi';

const Sidebar = () => {
  const role = localStorage.getItem('role') || 'User';
  const isAdmin = ['Super_Admin', 'HR_Manager'].includes(role);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon"></div>
        <div className="flex-col">
          <span className="sidebar-logo-text text-primary">flashEMS</span>
          <span className="sidebar-subtitle">{role.replace(/_/g, ' ')}</span>
        </div>
      </div>

      <div className="sidebar-section-title">Main</div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiHome size={18} /><span>Dashboard</span>
        </NavLink>

        {/* Employee-visible modules */}
        <NavLink to="/leave" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiCalendar size={18} /><span>Leave Management</span>
        </NavLink>
        <NavLink to="/work-updates" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiClipboard size={18} /><span>Work Updates</span>
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiTrendingUp size={18} /><span>Performance</span>
        </NavLink>
        <NavLink to="/salary" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiDollarSign size={18} /><span>Salary / Payslips</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FiUser size={18} /><span>My Profile</span>
        </NavLink>

        {/* Admin/HR-only modules */}
        {isAdmin && (
          <>
            <div className="sidebar-section-title" style={{ padding: '1rem 0 0.5rem' }}>Administration</div>
            <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <FiUsers size={18} /><span>Employees</span>
            </NavLink>
            <NavLink to="/payroll" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <FiFileText size={18} /><span>Payroll</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <FiBarChart2 size={18} /><span>Analytics</span>
            </NavLink>
            {role === 'Super_Admin' && (
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <FiSettings size={18} /><span>System Settings</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

      <nav className="sidebar-nav" style={{ flex: 'none', paddingBottom: '1.5rem' }}>
        <NavLink to="/help" className="nav-link">
          <FiHelpCircle size={18} /><span>Help Center</span>
        </NavLink>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <FiLogOut size={18} /><span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
