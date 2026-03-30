import React from 'react';
import { FiUsers, FiDollarSign, FiCalendar, FiTrendingUp, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#2b3bf7', '#6e6bfa', '#1fe5ff', '#10b981', '#f59e0b', '#ef4444'];

const employeeGrowth = [
  { name: 'Jul', count: 38 }, { name: 'Aug', count: 40 }, { name: 'Sep', count: 42 }, { name: 'Oct', count: 44 },
  { name: 'Nov', count: 48 }, { name: 'Dec', count: 50 }, { name: 'Jan', count: 51 }, { name: 'Feb', count: 53 }, { name: 'Mar', count: 54 },
];
const departmentData = [
  { name: 'Engineering', value: 22 }, { name: 'Design', value: 8 }, { name: 'Marketing', value: 10 },
  { name: 'Operations', value: 6 }, { name: 'HR', value: 4 }, { name: 'Finance', value: 4 },
];
const attendanceData = [
  { name: 'Mon', present: 52, absent: 2 }, { name: 'Tue', present: 50, absent: 4 }, { name: 'Wed', present: 53, absent: 1 },
  { name: 'Thu', present: 51, absent: 3 }, { name: 'Fri', present: 48, absent: 6 },
];
const leaveTypeData = [
  { name: 'Casual', value: 35 }, { name: 'Sick', value: 20 }, { name: 'Paid', value: 28 }, { name: 'Unpaid', value: 7 },
];
const payrollTrend = [
  { name: 'Oct', amount: 10.2 }, { name: 'Nov', amount: 10.8 }, { name: 'Dec', amount: 12.1 },
  { name: 'Jan', amount: 11.5 }, { name: 'Feb', amount: 11.9 }, { name: 'Mar', amount: 12.4 },
];
const performanceDistribution = [
  { name: '1-2', count: 2 }, { name: '2-3', count: 5 }, { name: '3-4', count: 18 }, { name: '4-5', count: 29 },
];

export default function AnalyticsPage() {
  return (
    <div className="animate-in">
      <div className="mb-6">
        <div className="page-label">Intelligence</div>
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Organization-wide insights and performance metrics.</p>
      </div>

      {/* Top Stats */}
      <div className="stats-grid mb-6">
        {[
          { icon: <FiUsers />, label: 'Total Employees', value: '54', change: '+3', up: true, color: '#2b3bf7', bg: '#eceeff' },
          { icon: <FiCalendar />, label: 'Attendance Rate', value: '96.2%', change: '+1.1%', up: true, color: '#10b981', bg: '#d1fae5' },
          { icon: <FiDollarSign />, label: 'Monthly Payroll', value: '₹12.4L', change: '+4.2%', up: true, color: '#f59e0b', bg: '#fef3c7' },
          { icon: <FiTrendingUp />, label: 'Avg Performance', value: '4.2/5', change: '+0.3', up: true, color: '#6e6bfa', bg: '#f0effe' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between items-center">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: s.up ? '#10b981' : '#ef4444' }}>
                {s.up ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />} {s.change}
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Growth + Department */}
      <div className="grid-2 mb-6">
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Employee Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={employeeGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[30, 60]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#2b3bf7" fill="#eceeff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Department Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {departmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Attendance + Leave */}
      <div className="grid-2 mb-6">
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Leave Types Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={leaveTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {leaveTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Payroll Trend + Performance */}
      <div className="grid-2">
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Payroll Trend (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={payrollTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `₹${v}L`} />
              <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-bold text-sm mb-4">Performance Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performanceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} label={{ value: 'Rating', position: 'bottom', fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Employees', angle: -90, position: 'left', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6e6bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
