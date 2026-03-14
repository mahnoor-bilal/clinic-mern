import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiShield, FiStar } from 'react-icons/fi';

export default function Home() {
  const stats = [['500+','Doctors'],['10k+','Patients'],['50k+','Appointments'],['4.9★','Rating']];
  const features = [
    { icon: <FiCalendar size={22} color="var(--primary)" />, title: 'Easy Booking', desc: 'Book appointments with top doctors in seconds. Choose your preferred time slot.' },
    { icon: <FiUsers size={22} color="var(--success)" />, title: 'Expert Doctors', desc: 'Access verified specialists across all medical fields, approved by our admin team.' },
    { icon: <FiShield size={22} color="var(--warning)" />, title: 'Secure Records', desc: 'Your prescriptions and medical history stored safely and accessible anytime.' },
    { icon: <FiStar size={22} color="#a855f7" />, title: 'Quality Care', desc: 'Rated 4.9/5 by thousands of satisfied patients across Pakistan.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 40%, #f5f7fa 100%)',
        paddingTop: 80
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dbeafe', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>Pakistan's Leading Clinic Platform</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.18, marginBottom: 20, color: 'var(--text)' }}>
              Your Health,<br />
              <span style={{ color: 'var(--primary)' }}>Our Priority</span>
            </h1>

            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              Connect with certified doctors, book appointments instantly, and manage your prescriptions — all in one place.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/doctors" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                Find a Doctor →
              </Link>
              <Link to="/register" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                Register Free
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 36, marginTop: 52 }}>
              {stats.map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{val}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration card */}
          <div style={{ position: 'relative' }}>
            <div className="card" style={{ padding: 32, maxWidth: 380, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '1.4rem' }}>👨‍⚕️</span>
                </div>
                <div>
                  <p style={{ fontWeight: 700 }}>Dr. Ali Khan</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Cardiologist • 12 yrs exp</p>
                </div>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Available</span>
              </div>

              {['09:00 AM', '10:00 AM', '11:00 AM'].map((t, i) => (
                <div key={t} style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                  background: i === 1 ? 'var(--primary)' : 'var(--surface2)',
                  color: i === 1 ? '#fff' : 'var(--text)', fontWeight: 600, fontSize: '0.88rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  {t}
                  {i === 1 && <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10 }}>Selected</span>}
                </div>
              ))}

              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: '12px' }}>
                Confirm Booking
              </button>
            </div>

            {/* Floating badge */}
            <div style={{ position: 'absolute', top: -16, right: 0, background: '#fff', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>💊</span>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>Prescription Ready</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>View & Download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Everything You Need</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>A complete clinic management solution</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ borderTop: '3px solid var(--primary)' }}>
                <div style={{ marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: 16 }}>Ready to get started?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: '1rem' }}>Join thousands of patients and doctors on MediCare</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn" style={{ background: '#fff', color: 'var(--primary)', padding: '12px 32px', fontSize: '0.95rem' }}>Create Account</Link>
            <Link to="/doctors" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', padding: '12px 32px', fontSize: '0.95rem' }}>Browse Doctors</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
