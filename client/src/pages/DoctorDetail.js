import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { FiClock, FiStar, FiCalendar } from 'react-icons/fi';

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/doctors/${id}`).then(({ data }) => setDoctor(data.doctor)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!doctor) return <div className="page container"><p>Doctor not found.</p></div>;

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 860 }}>
        {/* Header card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>
              👨‍⚕️
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Dr. {doctor.user?.name}</h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="badge badge-cyan">{doctor.specialization}</span>
                <span className="badge badge-gray">{doctor.qualification}</span>
              </div>
              <div style={{ display: 'flex', gap: 24, fontSize: '0.88rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FiClock size={13} />{doctor.experience} years experience</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--warning)' }}><FiStar size={13} fill="currentColor" />{doctor.rating || '4.8'} rating</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>Rs {doctor.consultationFee?.toLocaleString()} / consultation</span>
              </div>
            </div>
            <Link to={`/book/${doctor.user?._id}`} className="btn btn-primary" style={{ padding: '12px 28px' }}>
              <FiCalendar /> Book Appointment
            </Link>
          </div>
          {doctor.bio && <p style={{ marginTop: 20, color: 'var(--muted)', lineHeight: 1.7, fontSize: '0.92rem', borderTop: '1px solid var(--border)', paddingTop: 16 }}>{doctor.bio}</p>}
        </div>

        {/* Availability */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Available Days</h3>
          {doctor.availableSlots?.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No schedule set yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {days.map(day => {
                const slot = doctor.availableSlots?.find(s => s.day === day);
                return (
                  <div key={day} style={{ padding: '12px 16px', borderRadius: 9, border: '1px solid var(--border)', background: slot ? '#f0f9ff' : 'var(--surface2)', opacity: slot ? 1 : 0.5 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4, color: slot ? 'var(--primary)' : 'var(--muted)' }}>{day}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{slot ? `${slot.startTime} – ${slot.endTime}` : 'Unavailable'}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
