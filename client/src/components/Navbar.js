import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiActivity, FiLogOut, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard';

  const navLink = (to, label) => (
    <Link to={to} style={{
      fontSize: '0.88rem', fontWeight: 600, color: pathname === to ? 'var(--primary)' : 'var(--muted)',
      padding: '5px 2px', borderBottom: pathname === to ? '2px solid var(--primary)' : '2px solid transparent',
      transition: 'all 0.2s'
    }}>{label}</Link>
  );

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', height: 68,
      display: 'flex', alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiActivity size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text)' }}>MediCare</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {navLink('/doctors', 'Find Doctors')}
          {user && navLink(dashboardPath, 'Dashboard')}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                <FiUser size={15} color="var(--primary)" />
                <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{user.name.split(' ')[0]}</span>
                <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{user.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ gap: 5 }}>
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
