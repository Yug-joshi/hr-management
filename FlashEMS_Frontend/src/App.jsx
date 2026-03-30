import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeaveManagement from './pages/LeaveManagement';
import WorkUpdates from './pages/WorkUpdates';
import PerformancePage from './pages/Performance';
import SalaryPage from './pages/SalaryPage';
import ProfilePage from './pages/ProfilePage';
import EmployeeManagement from './pages/EmployeeManagement';
import PayrollSystem from './pages/PayrollSystem';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

// Auth guard
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// Admin guard
const AdminRoute = () => {
  const role = localStorage.getItem('role');
  if (!['Super_Admin', 'HR_Manager'].includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

// Layout with sidebar + header
const AppLayout = () => (
  <div className="app-container">
    <Sidebar />
    <div className="main-wrapper">
      <TopHeader />
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Shared routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/work-updates" element={<WorkUpdates />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/salary" element={<SalaryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* Admin/HR routes */}
            <Route element={<AdminRoute />}>
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/payroll" element={<PayrollSystem />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
