import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booked, setBooked] = useState(false);

  // Get doctor's _id (profile id) from user id
  const [doctorProfileId, setDoctorProfileId] = useState(null);

  useEffect(() => {
    api.get('/doctors').then(({ data }) => {
      const doc = data.doctors.find(d =>
        d.user?._id?.toString() === doctorId ||
        d.user?.toString() === doctorId
      );
      if (doc) { setDoctor(doc); setDoctorProfileId(doc._id); }
    });
  }, [doctorId]);

  useEffect(() => {
    if (!date || !doctorProfileId) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    api.get(`/doctors/${doctorProfileId}/slots?date=${date}`)
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, doctorProfileId]);

  const handleBook = async () => {
    if (!selectedSlot || !reason.trim()) { toast.warning('Please select a slot and enter a reason'); return; }
    setLoading(true);
    try {
      await api.post('/appointments', { doctorId, date, timeSlot: selectedSlot, reason });
      setBooked(true);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
    setLoading(false);
  };

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (booked) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <div style={{ padding: '80px 24px' }}>
        <FiCheckCircle size={72} color="var(--success)" style={{ marginBottom: 24 }} />
        <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>Appointment Booked!</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 36 }}>Your appointment is pending confirmation from the doctor.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>View My Appointments</button>
          <button className="btn btn-outline" onClick={() => navigate('/doctors')}>Find Another Doctor</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Book Appointment</h1>
        {doctor && <p style={{ color: 'var(--muted)', marginBottom: 32 }}>with Dr. {doctor.user?.name} · {doctor.specialization}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Step 1: Date */}
          <div className="card">
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiCalendar color="var(--primary)" /> Select Date</h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input type="date" value={date} min={minDate} onChange={e => setDate(e.target.value)}
                style={{ maxWidth: 260 }} />
            </div>
          </div>

          {/* Step 2: Time Slot */}
          {date && (
            <div className="card">
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiClock color="var(--primary)" /> Select Time Slot</h3>
              {loadingSlots ? <div className="spinner" style={{ margin: '20px auto' }} /> : slots.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--surface2)', borderRadius: 9 }}>
                  <p style={{ color: 'var(--muted)', marginBottom: 6 }}>⚠️ No slots available on this day.</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    This could mean the doctor hasn't set their schedule yet, or is not available on this day. Try a different date.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                  {slots.map(slot => (
                    <button key={slot.start} disabled={slot.isBooked} onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '10px', border: '2px solid', borderRadius: 9, cursor: slot.isBooked ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.18s', fontFamily: 'inherit',
                        background: slot.isBooked ? 'var(--surface2)' : selectedSlot?.start === slot.start ? 'var(--primary)' : '#fff',
                        color: slot.isBooked ? 'var(--muted)' : selectedSlot?.start === slot.start ? '#fff' : 'var(--text)',
                        borderColor: slot.isBooked ? 'var(--border)' : selectedSlot?.start === slot.start ? 'var(--primary)' : 'var(--border)',
                        opacity: slot.isBooked ? 0.6 : 1
                      }}>
                      {slot.start}
                      {slot.isBooked && <div style={{ fontSize: '0.65rem', fontWeight: 400, marginTop: 2 }}>Booked</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Reason */}
          {selectedSlot && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Reason for Visit</h3>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea rows={4} value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for the appointment..." />
              </div>
            </div>
          )}

          {/* Summary & Confirm */}
          {selectedSlot && reason && (
            <div className="card" style={{ background: '#f0f9ff', borderColor: 'var(--primary)' }}>
              <h3 style={{ marginBottom: 16 }}>Appointment Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  ['Doctor', `Dr. ${doctor?.user?.name}`],
                  ['Specialization', doctor?.specialization],
                  ['Date', new Date(date).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                  ['Time', `${selectedSlot.start} – ${selectedSlot.end}`],
                  ['Fee', `Rs ${doctor?.consultationFee?.toLocaleString()}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
                onClick={handleBook} disabled={loading}>
                {loading ? 'Booking...' : 'Confirm Appointment →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
