import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiUsers, FiCalendar, FiDollarSign, FiUserCheck } from 'react-icons/fi';

const STATUS_BADGE = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetches = [api.get('/admin/stats'), api.get('/admin/doctors/pending')];
    if (tab === 'users')        fetches.push(api.get('/admin/users'));
    if (tab === 'appointments') fetches.push(api.get('/appointments/all'));

    Promise.all(fetches).then(([{ data: s }, { data: pd }, extra]) => {
      setStats(s.stats);
      setPendingDoctors(pd.doctors);
      if (tab === 'users' && extra)        setUsers(extra.data.users);
      if (tab === 'appointments' && extra) setAppointments(extra.data.appointments);
    }).finally(() => setLoading(false));
  }, [tab]);

  const handleApprove = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/approve`);
      setPendingDoctors(d => d.filter(doc => doc._id !== doctorId));
      setStats(s => ({ ...s, pendingDoctors: s.pendingDoctors - 1, totalDoctors: s.totalDoctors + 1 }));
      toast.success('Doctor approved!');
    } catch { toast.error('Error approving doctor'); }
  };

  const handleReject = async (doctorId) => {
    if (!window.confirm('Reject and deactivate this doctor?')) return;
    try {
      await api.put(`/admin/doctors/${doctorId}/reject`);
      setPendingDoctors(d => d.filter(doc => doc._id !== doctorId));
      toast.success('Doctor rejected');
    } catch { toast.error('Error rejecting doctor'); }
  };

  const handleToggleUser = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle`);
      setUsers(u => u.map(usr => usr._id === userId ? data.user : usr));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Error updating user'); }
  };

  const ROLE_BADGE = { admin: 'badge-red', doctor: 'badge-cyan', patient: 'badge-blue' };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>Manage the entire MediCare platform</p>
        </div>

        {/* Pending approval alert */}
        {pendingDoctors.length > 0 && (
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            ⚠️ <strong>{pendingDoctors.length}</strong> doctor(s) are waiting for approval.
            <button className="btn btn-primary btn-sm" style={{ marginLeft: 16 }} onClick={() => setTab('doctors')}>
              Review Now
            </button>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Patients',   value: stats.totalPatients,   icon: <FiUsers size={20} />,      color: 'var(--primary)' },
              { label: 'Active Doctors',   value: stats.totalDoctors,    icon: <FiUserCheck size={20} />,  color: 'var(--success)' },
              { label: 'Total Appts',      value: stats.totalAppointments, icon: <FiCalendar size={20} />, color: '#a855f7' },
              { label: 'Total Revenue',    value: `Rs ${(stats.totalRevenue||0).toLocaleString()}`, icon: <FiDollarSign size={20} />, color: 'var(--warning)' },
              { label: 'Pending Doctors',  value: stats.pendingDoctors,  icon: <FiUsers size={20} />,      color: 'var(--danger)' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color, fontSize: '1.7rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {[
            ['overview',     '📊 Overview'],
            ['doctors',      '👨‍⚕️ Doctors'],
            ['users',        '👥 Users'],
            ['appointments', '📅 Appointments'],
          ].map(([key, label]) => (
            <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
              {key === 'doctors' && pendingDoctors.length > 0 && (
                <span style={{ background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>
                  {pendingDoctors.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Quick actions */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['👨‍⚕️ Manage Pending Doctors', 'doctors', pendingDoctors.length > 0],
                  ['👥 View All Users',          'users',   false],
                  ['📅 All Appointments',        'appointments', false],
                ].map(([label, target, highlight]) => (
                  <button key={label} className={`btn ${highlight ? 'btn-primary' : 'btn-outline'}`}
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                    onClick={() => setTab(target)}>
                    {label}
                    {highlight && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>{pendingDoctors.length} pending</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent pending doctors preview */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Pending Doctor Approvals</h3>
              {pendingDoctors.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>✅ All doctors approved!</p>
              ) : (
                pendingDoctors.slice(0, 4).map(doc => (
                  <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Dr. {doc.user?.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{doc.specialization}</p>
                    </div>
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(doc._id)}>Approve</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {tab === 'doctors' && (
          <div>
            <h3 style={{ marginBottom: 20 }}>
              Pending Approvals ({pendingDoctors.length})
            </h3>
            {pendingDoctors.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</p>
                <p>No pending doctor approvals.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pendingDoctors.map(doc => (
                  <div key={doc._id} className="card">
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                        👨‍⚕️
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: 4 }}>Dr. {doc.user?.name}</h4>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span className="badge badge-cyan">{doc.specialization}</span>
                          <span className="badge badge-gray">{doc.qualification}</span>
                          <span className="badge badge-blue">{doc.experience} yrs exp</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                          📧 {doc.user?.email}
                          {doc.user?.phone && ` · 📱 ${doc.user.phone}`}
                          {' · '}💰 Rs {doc.consultationFee?.toLocaleString()}/visit
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                          Registered: {new Date(doc.user?.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-success" onClick={() => handleApprove(doc._id)}>
                          ✓ Approve
                        </button>
                        <button className="btn btn-danger" onClick={() => handleReject(doc._id)}>
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem' }}>All Users ({users.length})</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                      <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.83rem' }}>{u.phone || '—'}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggleUser(u._id)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1rem' }}>All Appointments ({appointments.length})</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Fee</th><th>Paid</th></tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{a.patient?.name}</td>
                      <td>{a.doctor?.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(a.date).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--muted)' }}>{a.timeSlot?.start}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[a.status]}`} style={{ textTransform: 'capitalize' }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>Rs {a.fee?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${a.isPaid ? 'badge-green' : 'badge-yellow'}`}>
                          {a.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
