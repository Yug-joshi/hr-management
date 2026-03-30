import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiEdit2, FiSave, FiUpload, FiFileText } from 'react-icons/fi';
import API from '../api';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: localStorage.getItem('name') || 'User',
    email: '', phone: '', address: '', department: '', designation: '', role: localStorage.getItem('role') || 'User',
    joinDate: '', _id: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      if (profile._id && !String(profile._id).startsWith('demo_')) {
        await API.put(`/auth/employee/${profile._id}`, {
          name: profile.name, phone: profile.phone, address: profile.address
        });
      }
      localStorage.setItem('name', profile.name);
      setEditing(false);
      alert('Profile updated!');
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="page-label">Account</div>
          <h1 className="page-title">My Profile</h1>
        </div>
        <button className={`btn ${editing ? 'btn-success' : 'btn-primary'}`} onClick={editing ? handleSave : () => setEditing(true)}>
          {editing ? <><FiSave size={14} /> Save Changes</> : <><FiEdit2 size={14} /> Edit Profile</>}
        </button>
      </div>

      <div className="grid-2">
        {/* Profile Card */}
        <div className="card">
          <div className="flex items-center gap-4 mb-6" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2b3bf7&color=fff&size=80`} alt="" style={{ width: '80px', height: '80px', borderRadius: '20px' }} />
            <div>
              <h2 className="font-bold text-xl">{profile.name}</h2>
              <div className="text-sm text-muted">{profile.designation || 'Staff'} • {profile.department || 'General'}</div>
              <span className="badge badge-info mt-2">{(profile.role || 'User').replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div className="flex-col gap-4">
            <div className="form-group">
              <label className="form-label"><FiUser size={12} /> Full Name</label>
              {editing ? <input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                : <div className="text-sm font-medium">{profile.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label"><FiMail size={12} /> Email</label>
              <div className="text-sm font-medium">{profile.email || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label"><FiPhone size={12} /> Phone</label>
              {editing ? <input className="form-input" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 98765 43210" />
                : <div className="text-sm font-medium">{profile.phone || 'Not set'}</div>}
            </div>
            <div className="form-group">
              <label className="form-label"><FiMapPin size={12} /> Address</label>
              {editing ? <textarea className="form-textarea" style={{ minHeight: '60px' }} value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Your address..." />
                : <div className="text-sm font-medium">{profile.address || 'Not set'}</div>}
            </div>
          </div>
        </div>

        {/* Employment Info */}
        <div className="flex-col gap-6">
          <div className="card">
            <h3 className="font-bold mb-4">Employment Details</h3>
            <div className="flex-col gap-3">
              {[
                { icon: <FiBriefcase size={14} />, label: 'Department', value: profile.department || 'General' },
                { icon: <FiUser size={14} />, label: 'Designation', value: profile.designation || 'Staff' },
                { icon: <FiCalendar size={14} />, label: 'Joined', value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { icon: <FiUser size={14} />, label: 'Role', value: (profile.role || 'User').replace(/_/g, ' ') },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center" style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex items-center gap-2 text-sm text-muted">{item.icon} {item.label}</div>
                  <div className="text-sm font-bold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {profile.leaveBalance && (
            <div className="card">
              <h3 className="font-bold mb-4">Leave Balance</h3>
              <div className="flex-col gap-2">
                {Object.entries(profile.leaveBalance).map(([type, days]) => (
                  <div key={type} className="flex justify-between items-center" style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <span className="text-sm" style={{ textTransform: 'capitalize' }}>{type}</span>
                    <span className="text-sm font-bold">{days} days</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
