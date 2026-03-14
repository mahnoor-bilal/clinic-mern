import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiSearch, FiStar, FiClock, FiDollarSign } from 'react-icons/fi';

const SPECS = ['All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General', 'Gynecology', 'ENT', 'Ophthalmology'];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (spec && spec !== 'All') params.set('specialization', spec);
    api.get(`/doctors?${params}`).then(({ data }) => setDoctors(data.doctors)).finally(() => setLoading(false));
  }, [search, spec]);

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Find a Doctor</h1>
          <p style={{ color: 'var(--muted)' }}>Browse {doctors.length} verified specialists</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input placeholder="Search by name or specialty..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 38, padding: '10px 14px 10px 38px', width: '100%', border: '1.5px solid var(--border)', borderRadius: 9, background: '#fff', fontFamily: 'inherit', fontSize: '0.9rem' }} />
          </div>
          <select value={spec} onChange={e => setSpec(e.target.value)}
            style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 9, background: '#fff', fontFamily: 'inherit', fontSize: '0.9rem', minWidth: 180 }}>
            {SPECS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="spinner" /> : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</p>
            <p>No doctors found. Try different filters.</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {doctors.map(doc => (
              <div key={doc._id} className="card" style={{ transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(14,165,233,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>

                <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Dr. {doc.user?.name}</h3>
                    <span className="badge badge-cyan">{doc.specialization}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 14 }}>{doc.qualification}</p>

                <div style={{ display: 'flex', gap: 16, marginBottom: 18, fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)' }}>
                    <FiClock size={13} />{doc.experience} yrs exp
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--warning)' }}>
                    <FiStar size={13} fill="currentColor" />{doc.rating || '4.8'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiDollarSign size={14} color="var(--success)" />
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>Rs {doc.consultationFee?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/doctors/${doc._id}`} className="btn btn-outline btn-sm">View</Link>
                    <Link to={`/book/${doc.user?._id}`} className="btn btn-primary btn-sm">Book</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
