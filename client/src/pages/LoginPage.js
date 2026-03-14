import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiActivity } from 'react-icons/fi';

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center', marginBottom: 32 }}>
    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FiActivity size={18} color="#fff" />
    </div>
    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>MediCare</span>
  </div>
);

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin')   navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #f0f9ff, #f5f7fa)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Logo />
        <div className="card">
          <h2 style={{ marginBottom: 6, fontSize: '1.4rem' }}>Sign In</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 24 }}>Welcome back to MediCare</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@example.com" />
            </div>
            <div className="form-group"><label>Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--muted)' }}>
            No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
        {/* Demo accounts */}
        <div className="card" style={{ marginTop: 16, padding: 16 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>DEMO ACCOUNTS</p>
          {[['Admin','admin@clinic.com'],['Doctor','drali@test.com'],['Patient','sara@test.com']].map(([role, email]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '3px 0' }}>
              <span style={{ color: 'var(--muted)' }}>{role}</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{email} / pass123</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', specialization: '', qualification: '', consultationFee: '', experience: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const user = await register({ ...form, role, consultationFee: Number(form.consultationFee), experience: Number(form.experience) });
      toast.success('Account created successfully!');
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({...p, [k]: e.target.value})) });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #f0f9ff, #f5f7fa)', padding: '100px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <Logo />
        <div className="card">
          <h2 style={{ marginBottom: 6, fontSize: '1.4rem' }}>Create Account</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 24 }}>Join MediCare today</p>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {['patient','doctor'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                style={{ padding: '12px', border: '2px solid', borderColor: role === r ? 'var(--primary)' : 'var(--border)', borderRadius: 9, background: role === r ? '#eff6ff' : 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: role === r ? 'var(--primary)' : 'var(--muted)', transition: 'all 0.2s' }}>
                {r === 'patient' ? '🧑‍💼 Patient' : '👨‍⚕️ Doctor'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Full Name</label><input type="text" required placeholder="Ali Khan" {...f('name')} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Email</label><input type="email" required placeholder="you@email.com" {...f('email')} /></div>
              <div className="form-group"><label>Password</label><input type="password" required minLength={6} placeholder="Min 6 chars" {...f('password')} /></div>
              <div className="form-group"><label>Phone</label><input type="text" placeholder="03001234567" {...f('phone')} /></div>

              {role === 'doctor' && (<>
                <div className="form-group"><label>Specialization</label><input type="text" required placeholder="Cardiology" {...f('specialization')} /></div>
                <div className="form-group"><label>Qualification</label><input type="text" required placeholder="MBBS, FCPS" {...f('qualification')} /></div>
                <div className="form-group"><label>Fee (Rs)</label><input type="number" required min={0} placeholder="1500" {...f('consultationFee')} /></div>
                <div className="form-group"><label>Experience (yrs)</label><input type="number" min={0} placeholder="5" {...f('experience')} /></div>
              </>)}
            </div>

            {role === 'doctor' && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                ℹ️ Doctor accounts require admin approval before you can accept appointments.
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.88rem', color: 'var(--muted)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
