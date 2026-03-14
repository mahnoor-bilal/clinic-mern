import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiPrinter, FiArrowLeft, FiActivity } from 'react-icons/fi';

export default function PrescriptionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/prescriptions/${id}`).then(({ data }) => setPrescription(data.prescription)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!prescription) return <div className="page container"><p>Prescription not found.</p></div>;

  const p = prescription;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Action bar — hidden on print */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }} className="no-print">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <FiArrowLeft size={15} /> Back
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <FiPrinter size={15} /> Print / Save PDF
          </button>
        </div>

        {/* Prescription card */}
        <div className="card" id="prescription-print" style={{ padding: 40 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 24, borderBottom: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiActivity size={20} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>MediCare</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Medical Prescription</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 2 }}>Prescription Date</p>
              <p style={{ fontWeight: 700 }}>{new Date(p.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace', marginTop: 4 }}>#{p._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Doctor & Patient info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
            <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Prescribing Doctor</p>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>Dr. {p.doctor?.name}</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--muted)', marginTop: 2 }}>{p.doctor?.email}</p>
            </div>
            <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Patient</p>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>{p.patient?.name}</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--muted)', marginTop: 2 }}>{p.patient?.email}</p>
            </div>
          </div>

          {/* Appointment info */}
          {p.appointment && (
            <div style={{ padding: '10px 16px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 24, fontSize: '0.83rem', color: 'var(--muted)' }}>
              <span>📅 Appointment: {new Date(p.appointment.date).toLocaleDateString()}</span>
              <span>🕐 {p.appointment.timeSlot?.start} – {p.appointment.timeSlot?.end}</span>
              {p.appointment.reason && <span>📋 {p.appointment.reason}</span>}
            </div>
          )}

          {/* Diagnosis */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Diagnosis</p>
            <div style={{ padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9, borderLeft: '4px solid var(--warning)' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{p.diagnosis}</p>
            </div>
          </div>

          {/* Medicines */}
          {p.medicines?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Medicines ({p.medicines.length})
              </p>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)' }}>
                      {['#', 'Medicine', 'Dosage', 'Frequency', 'Duration', 'Notes'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.medicines.map((m, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{m.dosage}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--muted)' }}>{m.frequency}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--muted)' }}>{m.duration}</td>
                        <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--muted)', fontStyle: 'italic' }}>{m.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lab Tests */}
          {p.labTests?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Recommended Lab Tests</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {p.labTests.map(t => (
                  <span key={t} style={{ padding: '5px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, fontSize: '0.83rem', fontWeight: 600, color: '#15803d' }}>
                    🧪 {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {p.instructions && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Instructions</p>
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 9, fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text)' }}>
                {p.instructions}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {p.followUpDate && (
            <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: '1.2rem' }}>📅</span>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Follow-up Appointment</p>
                <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>{new Date(p.followUpDate).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ paddingTop: 24, borderTop: '2px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              <p>MediCare Platform</p>
              <p>This prescription is digitally generated</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ width: 140, borderBottom: '1.5px solid var(--text)', marginBottom: 6 }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Doctor's Signature</p>
              <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Dr. {p.doctor?.name}</p>
            </div>
          </div>
        </div>

        {/* Print styles injected inline */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            nav { display: none !important; }
            body { background: white; }
            .page { padding: 0 !important; }
            .card { box-shadow: none !important; border: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
