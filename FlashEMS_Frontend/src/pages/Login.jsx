import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eceeff 0%, #f5f5fb 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(43,59,247,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(110,107,250,0.15) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>

      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '3rem',
        position: 'relative',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 25px 50px -12px rgba(43, 59, 247, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="sidebar-logo-icon" style={{ width: '48px', height: '48px' }}></div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em' }} className="text-primary">
          Welcome back
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }} className="text-muted">
          Sign into your flashEMS account
        </p>

        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '1.5rem', fontSize: '0.75rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>DEMO ACCOUNTS</div>
          <div style={{ color: '#666', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div><b>Admin:</b> admin@flashems.com / admin123</div>
            <div><b>HR:</b> hr@flashems.com / hr123</div>
            <div><b>Employee:</b> employee@flashems.com / emp123</div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid #fca5a5'
          }}>
            <FiAlertCircle size={18} />
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--primary)' }}>Work Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="email"
                name="flashems-email"
                autoComplete="off"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.8rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--white)',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem'
                }}
                placeholder="admin@flashems.com"
                required
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--primary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                name="flashems-password"
                autoComplete="off"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 2.8rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--white)',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem'
                }}
                placeholder="••••••••"
                required
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              marginTop: '1rem',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.3s'
            }}
            disabled={loading}
          >
            {loading ? <span style={{ opacity: 0.8 }}>Authenticating...</span> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
