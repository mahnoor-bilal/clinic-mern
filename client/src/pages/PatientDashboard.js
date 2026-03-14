import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiFileText, FiUser, FiX } from 'react-icons/fi';

const STATUS_BADGE = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };

export default function PatientDashboard() {
  const [tab, setTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/my'),
      api.get('/prescriptions/my'),
      api.get('/patients/me')
    ]).then(([a, p, pr]) => {
      setAppointments(a.data.appointments);
      setPrescriptions(p.data.prescriptions);
      setProfile(pr.data.patient);
    }).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation (optional):') || 'Patient cancelled';
    try {
      await api.put(`/appointments/${id}/cancel`, { cancelReason: reason });
      setAppointments(a => a.map(ap => ap._id === id ? { ...ap, status: 'cancelled' } : ap));
      toast.success('Appointment cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>My Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>Manage your appointments and health records</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Appointments', value: appointments.length, icon: '📅' },
            { label: 'Upcoming', value: appointments.filter(a => ['pending','confirmed'].includes(a.status)).length, icon: '⏰' },
            { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: '✅' },
            { label: 'Prescriptions', value: prescriptions.length, icon: '💊' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          {[['appointments','📅 Appointments'],['prescriptions','💊 Prescriptions'],['profile','👤 My Profile']].map(([key, label]) => (
            <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>My Appointments ({appointments.length})</h3>
              <Link to="/doctors" className="btn btn-primary btn-sm">+ Book New</Link>
            </div>
            {appointments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📅</p>
                <p>No appointments yet. <Link to="/doctors" style={{ color: 'var(--primary)' }}>Book one now!</Link></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {appointments.map(a => (
                  <div key={a._id} className="card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <h4 style={{ fontSize: '0.95rem' }}>Dr. {a.doctor?.name}</h4>
                        <span className={`badge ${STATUS_BADGE[a.status]}`} style={{ textTransform: 'capitalize' }}>{a.status}</span>
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: '0.83rem', marginBottom: 4 }}>
                        📅 {new Date(a.date).toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        &nbsp;·&nbsp; 🕐 {a.timeSlot?.start} – {a.timeSlot?.end}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{a.reason}</p>
                      {a.notes && <p style={{ fontSize: '0.83rem', color: 'var(--primary)', marginTop: 6 }}>Doctor's note: {a.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.88rem' }}>Rs {a.fee?.toLocaleString()}</span>
                      {['pending','confirmed'].includes(a.status) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a._id)}>
                          <FiX size={13} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {tab === 'prescriptions' && (
          <div>
            <h3 style={{ marginBottom: 20 }}>My Prescriptions ({prescriptions.length})</h3>
            {prescriptions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>💊</p>
                <p>No prescriptions yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {prescriptions.map(p => (
                  <div key={p._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ marginBottom: 4 }}>{p.diagnosis}</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                          Dr. {p.doctor?.name} · {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/prescriptions/${p._id}`} className="btn btn-outline btn-sm"><FiFileText size={13} /> View</Link>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {p.medicines?.slice(0, 3).map(m => (
                        <span key={m.name} className="badge badge-blue">{m.name} {m.dosage}</span>
                      ))}
                      {p.medicines?.length > 3 && <span className="badge badge-gray">+{p.medicines.length - 3} more</span>}
                    </div>
                    {p.followUpDate && <p style={{ fontSize: '0.82rem', color: 'var(--warning)', marginTop: 10 }}>📅 Follow-up: {new Date(p.followUpDate).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && profile && (
          <div className="card" style={{ maxWidth: 560 }}>
            <h3 style={{ marginBottom: 20 }}>Health Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Blood Group', profile.bloodGroup],
                ['Gender', profile.gender],
                ['Date of Birth', profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'],
                ['Address', profile.address || 'Not set'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{value}</p>
                </div>
              ))}
            </div>
            {profile.allergies?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Allergies</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {profile.allergies.map(a => <span key={a} className="badge badge-red">{a}</span>)}
                </div>
              </div>
            )}
            {profile.medicalHistory?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Medical History</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {profile.medicalHistory.map(m => <span key={m} className="badge badge-yellow">{m}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
