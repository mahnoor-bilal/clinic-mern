import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const STATUS_BADGE = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DoctorDashboard() {
  const [tab, setTab] = useState('schedule');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [rxForm, setRxForm] = useState({ diagnosis: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }], labTests: '', instructions: '', followUpDate: '' });
  const [profileForm, setProfileForm] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/doctor'),
      api.get('/prescriptions/doctor'),
      api.get('/doctors/me')
    ]).then(([a, p, d]) => {
      setAppointments(a.data.appointments);
      setPrescriptions(p.data.prescriptions);
      setProfile(d.data.doctor);
      setProfileForm({ bio: d.data.doctor.bio || '', consultationFee: d.data.doctor.consultationFee, experience: d.data.doctor.experience, availableSlots: d.data.doctor.availableSlots || [] });
    }).finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id) => {
    try {
      const { data } = await api.put(`/appointments/${id}/confirm`, { notes: '' });
      setAppointments(a => a.map(ap => ap._id === id ? data.appointment : ap));
      toast.success('Appointment confirmed');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleComplete = async (id) => {
    try {
      const { data } = await api.put(`/appointments/${id}/complete`);
      setAppointments(a => a.map(ap => ap._id === id ? data.appointment : ap));
      toast.success('Marked as completed');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handlePrescribe = async () => {
    try {
      const payload = {
        appointmentId: selectedAppt._id,
        diagnosis: rxForm.diagnosis,
        medicines: rxForm.medicines.filter(m => m.name),
        labTests: rxForm.labTests.split(',').map(t => t.trim()).filter(Boolean),
        instructions: rxForm.instructions,
        followUpDate: rxForm.followUpDate || undefined
      };
      await api.post('/prescriptions', payload);
      toast.success('Prescription created!');
      setSelectedAppt(null);
      const { data } = await api.get('/prescriptions/doctor');
      setPrescriptions(data.prescriptions);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const addMedicine = () => setRxForm(f => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', frequency: '', duration: '', notes: '' }] }));
  const updateMed = (i, k, v) => setRxForm(f => { const m = [...f.medicines]; m[i][k] = v; return { ...f, medicines: m }; });

  const handleUpdateProfile = async () => {
    try {
      await api.put('/doctors/me', profileForm);
      toast.success('Profile updated!');
    } catch (err) { toast.error('Error updating profile'); }
  };

  const toggleSlot = (day) => {
    const slots = profileForm.availableSlots || [];
    const exists = slots.find(s => s.day === day);
    if (exists) {
      setProfileForm(f => ({ ...f, availableSlots: slots.filter(s => s.day !== day) }));
    } else {
      setProfileForm(f => ({ ...f, availableSlots: [...slots, { day, startTime: '09:00', endTime: '17:00' }] }));
    }
  };

  const updateSlotTime = (day, field, value) => {
    setProfileForm(f => ({
      ...f,
      availableSlots: f.availableSlots.map(s => s.day === day ? { ...s, [field]: value } : s)
    }));
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Doctor Dashboard</h1>
          {profile && <p style={{ color: 'var(--muted)' }}>Dr. {profile.user?.name} · {profile.specialization}</p>}
          {!profile?.isApproved && <div className="alert alert-info" style={{ marginTop: 12 }}>⏳ Your account is pending admin approval. You will be notified once approved.</div>}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Patients', value: new Set(appointments.map(a => a.patient?._id)).size, icon: '🧑‍🤝‍🧑' },
            { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, icon: '⏰' },
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
          {[['schedule','📅 Schedule'],['prescriptions','💊 Prescriptions'],['settings','⚙️ Profile']].map(([key, label]) => (
            <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* Schedule */}
        {tab === 'schedule' && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Appointments ({appointments.length})</h3>
            {appointments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}><p>No appointments yet.</p></div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Fee</th><th>Actions</th></tr></thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 600 }}>{a.patient?.name}</td>
                        <td>{new Date(a.date).toLocaleDateString()}</td>
                        <td>{a.timeSlot?.start}</td>
                        <td style={{ color: 'var(--muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                        <td><span className={`badge ${STATUS_BADGE[a.status]}`} style={{ textTransform: 'capitalize' }}>{a.status}</span></td>
                        <td>Rs {a.fee?.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {a.status === 'pending'    && <button className="btn btn-success btn-sm" onClick={() => handleConfirm(a._id)}>Confirm</button>}
                            {a.status === 'confirmed'  && <button className="btn btn-primary btn-sm" onClick={() => handleComplete(a._id)}>Complete</button>}
                            {['confirmed','completed'].includes(a.status) && !prescriptions.find(p => p.appointment?._id === a._id) && (
                              <button className="btn btn-warning btn-sm" onClick={() => { setSelectedAppt(a); setTab('prescribe'); }}>Prescribe</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Prescribe form */}
        {tab === 'prescribe' && selectedAppt && (
          <div className="card" style={{ maxWidth: 700 }}>
            <h3 style={{ marginBottom: 6 }}>New Prescription</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>Patient: {selectedAppt.patient?.name} · {new Date(selectedAppt.date).toLocaleDateString()}</p>

            <div className="form-group"><label>Diagnosis *</label><input type="text" value={rxForm.diagnosis} onChange={e => setRxForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Stable Angina" /></div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 10, fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Medicines</label>
              {rxForm.medicines.map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 10, padding: 12, background: 'var(--surface2)', borderRadius: 9 }}>
                  <input placeholder="Medicine name" value={m.name} onChange={e => updateMed(i, 'name', e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.85rem' }} />
                  <input placeholder="Dosage" value={m.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.85rem' }} />
                  <input placeholder="Frequency" value={m.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.85rem' }} />
                  <input placeholder="Duration" value={m.duration} onChange={e => updateMed(i, 'duration', e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.85rem' }} />
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addMedicine}>+ Add Medicine</button>
            </div>

            <div className="form-group"><label>Lab Tests (comma separated)</label><input type="text" value={rxForm.labTests} onChange={e => setRxForm(f => ({ ...f, labTests: e.target.value }))} placeholder="ECG, CBC, Lipid Profile" /></div>
            <div className="form-group"><label>Instructions</label><textarea rows={3} value={rxForm.instructions} onChange={e => setRxForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Special instructions for the patient..." /></div>
            <div className="form-group"><label>Follow-up Date</label><input type="date" value={rxForm.followUpDate} onChange={e => setRxForm(f => ({ ...f, followUpDate: e.target.value }))} /></div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={handlePrescribe}>Save Prescription</button>
              <button className="btn btn-outline" onClick={() => { setSelectedAppt(null); setTab('schedule'); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Prescriptions */}
        {tab === 'prescriptions' && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Issued Prescriptions ({prescriptions.length})</h3>
            {prescriptions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}><p>No prescriptions issued yet.</p></div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Follow-up</th></tr></thead>
                  <tbody>
                    {prescriptions.map(p => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.patient?.name}</td>
                        <td>{p.diagnosis}</td>
                        <td>{p.medicines?.length} medicine(s)</td>
                        <td style={{ color: 'var(--muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--warning)' }}>{p.followUpDate ? new Date(p.followUpDate).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && profileForm && (
          <div className="card" style={{ maxWidth: 600 }}>
            <h3 style={{ marginBottom: 20 }}>Update Profile</h3>
            <div className="form-group"><label>Bio</label><textarea rows={3} value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label>Consultation Fee (Rs)</label><input type="number" value={profileForm.consultationFee} onChange={e => setProfileForm(f => ({ ...f, consultationFee: e.target.value }))} /></div>
              <div className="form-group"><label>Experience (yrs)</label><input type="number" value={profileForm.experience} onChange={e => setProfileForm(f => ({ ...f, experience: e.target.value }))} /></div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 10, fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Available Days & Hours</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DAYS.map(day => {
                  const active = profileForm.availableSlots?.find(s => s.day === day);
                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1.5px solid', borderColor: active ? 'var(--primary)' : 'var(--border)', borderRadius: 9, background: active ? '#f0f9ff' : 'transparent', transition: 'all 0.18s' }}>
                      <button type="button" onClick={() => toggleSlot(day)}
                        style={{ width: 20, height: 20, borderRadius: 5, border: '2px solid', borderColor: active ? 'var(--primary)' : 'var(--border)', background: active ? 'var(--primary)' : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem' }}>
                        {active ? '✓' : ''}
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', width: 96, color: active ? 'var(--primary)' : 'var(--muted)' }}>{day}</span>
                      {active && (<>
                        <input type="time" value={active.startTime} onChange={e => updateSlotTime(day, 'startTime', e.target.value)}
                          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.85rem', background: '#fff' }} />
                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>to</span>
                        <input type="time" value={active.endTime} onChange={e => updateSlotTime(day, 'endTime', e.target.value)}
                          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.85rem', background: '#fff' }} />
                      </>)}
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleUpdateProfile}>Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}
