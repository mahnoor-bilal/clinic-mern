const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../server/index');

let mongoServer;
let patientToken, doctorToken, adminToken;
let patientId, doctorUserId, doctorProfileId;
let appointmentId, prescriptionId;

const api = (method, path, token) => {
  const req = request(app)[method]('/api' + path).set('Content-Type', 'application/json');
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ══════════════════════════════════════════════════════
// MODULE 1 — AUTH & REGISTRATION
// ══════════════════════════════════════════════════════
describe('🔐 MODULE 1 — Auth & Registration', () => {

  test('TC-01 | Register a new patient', async () => {
    const res = await api('post', '/auth/register').send({
      name: 'Sara Ahmed', email: 'sara@test.com', password: 'pass123', role: 'patient', phone: '03001234567'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('patient');
    patientToken = res.body.token;
    patientId    = res.body.user.id;
  });

  test('TC-02 | Register a new doctor', async () => {
    const res = await api('post', '/auth/register').send({
      name: 'Dr. Ali Khan', email: 'drali@test.com', password: 'pass123',
      role: 'doctor', phone: '03009876543',
      specialization: 'Cardiology', qualification: 'MBBS, FCPS', consultationFee: 1500, experience: 10
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('doctor');
    doctorToken  = res.body.token;
    doctorUserId = res.body.user.id;
  });

  test('TC-03 | Reject duplicate email registration', async () => {
    const res = await api('post', '/auth/register').send({
      name: 'Dup', email: 'sara@test.com', password: 'pass123'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('TC-04 | Login with correct credentials', async () => {
    const res = await api('post', '/auth/login').send({ email: 'sara@test.com', password: 'pass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('TC-05 | Reject login with wrong password', async () => {
    const res = await api('post', '/auth/login').send({ email: 'sara@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('TC-06 | Get my profile (protected route)', async () => {
    const res = await api('get', '/auth/me', patientToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('sara@test.com');
  });

  test('TC-07 | Block unauthenticated access', async () => {
    const res = await api('get', '/auth/me');
    expect(res.statusCode).toBe(401);
  });

});

// ══════════════════════════════════════════════════════
// MODULE 2 — DOCTORS
// ══════════════════════════════════════════════════════
describe('👨‍⚕️ MODULE 2 — Doctors', () => {

  beforeAll(async () => {
    // Create and approve doctor via DB for appointment tests
    const Doctor = require('../server/models/Doctor');
    const doctor = await Doctor.findOne({ user: doctorUserId });
    doctorProfileId = doctor._id.toString();

    // Add available slots
    doctor.availableSlots = [
      { day: 'Monday',    startTime: '09:00', endTime: '12:00' },
      { day: 'Tuesday',   startTime: '09:00', endTime: '12:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '12:00' },
      { day: 'Thursday',  startTime: '09:00', endTime: '12:00' },
      { day: 'Friday',    startTime: '09:00', endTime: '12:00' }
    ];
    doctor.isApproved = true;
    await doctor.save();
  });

  test('TC-08 | Get list of approved doctors (public)', async () => {
    const res = await api('get', '/doctors');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.doctors)).toBe(true);
    expect(res.body.doctors.length).toBeGreaterThanOrEqual(1);
  });

  test('TC-09 | Doctor can update their own profile', async () => {
    const res = await api('put', '/doctors/me', doctorToken).send({
      specialization: 'Cardiology', qualification: 'MBBS, FCPS',
      consultationFee: 2000, experience: 12, bio: 'Expert cardiologist with 12 years of experience.'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.doctor.consultationFee).toBe(2000);
  });

  test('TC-10 | Patient cannot update doctor profile', async () => {
    const res = await api('put', '/doctors/me', patientToken).send({ consultationFee: 100 });
    expect(res.statusCode).toBe(403);
  });

  test('TC-11 | Get available slots for a doctor', async () => {
    // Find a Monday
    const date = new Date();
    while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().split('T')[0];

    const res = await api('get', `/doctors/${doctorProfileId}/slots?date=${dateStr}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
    expect(res.body.slots.length).toBeGreaterThan(0);
    expect(res.body.slots[0]).toHaveProperty('start');
    expect(res.body.slots[0]).toHaveProperty('isBooked');
  });

});

// ══════════════════════════════════════════════════════
// MODULE 3 — PATIENTS
// ══════════════════════════════════════════════════════
describe('🧑‍🤝‍🧑 MODULE 3 — Patients', () => {

  test('TC-12 | Patient can update their health profile', async () => {
    const res = await api('put', '/patients/me', patientToken).send({
      gender: 'female', bloodGroup: 'B+', dateOfBirth: '1995-06-15',
      address: 'House 12, Rawalpindi',
      emergencyContact: { name: 'Ahmed Ali', phone: '03011112222' },
      medicalHistory: ['Diabetes', 'Hypertension'],
      allergies: ['Penicillin']
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.patient.bloodGroup).toBe('B+');
    expect(res.body.patient.allergies).toContain('Penicillin');
  });

  test('TC-13 | Patient can view their own profile', async () => {
    const res = await api('get', '/patients/me', patientToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.patient.gender).toBe('female');
  });

  test('TC-14 | Doctor cannot access patient profile endpoint as patient', async () => {
    const res = await api('get', '/patients/me', doctorToken);
    expect(res.statusCode).toBe(403);
  });

});

// ══════════════════════════════════════════════════════
// MODULE 4 — APPOINTMENTS
// ══════════════════════════════════════════════════════
describe('📅 MODULE 4 — Appointments', () => {

  test('TC-15 | Patient can book an appointment', async () => {
    // Pick next Monday
    const date = new Date();
    while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().split('T')[0];

    const res = await api('post', '/appointments', patientToken).send({
      doctorId: doctorUserId,
      date: dateStr,
      timeSlot: { start: '09:00', end: '09:30' },
      reason: 'Chest pain and shortness of breath'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.appointment.status).toBe('pending');
    expect(res.body.appointment.fee).toBe(2000);
    appointmentId = res.body.appointment._id;
  });

  test('TC-16 | Cannot double-book the same slot', async () => {
    const date = new Date();
    while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().split('T')[0];

    // Register a second patient
    const reg = await api('post', '/auth/register').send({
      name: 'Patient Two', email: 'patient2@test.com', password: 'pass123', role: 'patient'
    });
    const token2 = reg.body.token;

    const res = await api('post', '/appointments', token2).send({
      doctorId: doctorUserId,
      date: dateStr,
      timeSlot: { start: '09:00', end: '09:30' },
      reason: 'Routine checkup'
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already booked/i);
  });

  test('TC-17 | Patient cannot book an unapproved doctor', async () => {
    // Register a new unapproved doctor
    const regDoc = await api('post', '/auth/register').send({
      name: 'Dr. Unapproved', email: 'unapproved@test.com', password: 'pass123',
      role: 'doctor', specialization: 'Dermatology', qualification: 'MBBS', consultationFee: 1000
    });
    const newDocId = regDoc.body.user.id;

    const date = new Date();
    date.setDate(date.getDate() + 3);
    const res = await api('post', '/appointments', patientToken).send({
      doctorId: newDocId,
      date: date.toISOString().split('T')[0],
      timeSlot: { start: '10:00', end: '10:30' },
      reason: 'Skin issue'
    });
    expect(res.statusCode).toBe(404);
  });

  test('TC-18 | Doctor can confirm an appointment', async () => {
    const res = await api('put', `/appointments/${appointmentId}/confirm`, doctorToken).send({
      notes: 'Patient to bring previous reports'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.appointment.status).toBe('confirmed');
  });

  test('TC-19 | Doctor can mark appointment as completed', async () => {
    const res = await api('put', `/appointments/${appointmentId}/complete`, doctorToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.appointment.status).toBe('completed');
    expect(res.body.appointment.isPaid).toBe(true);
  });

  test('TC-20 | Cannot cancel a completed appointment', async () => {
    const res = await api('put', `/appointments/${appointmentId}/cancel`, patientToken).send({
      cancelReason: 'Changed my mind'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot cancel/i);
  });

  test('TC-21 | Patient can view their appointments', async () => {
    const res = await api('get', '/appointments/my', patientToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.appointments.length).toBeGreaterThanOrEqual(1);
  });

  test('TC-22 | Doctor can view their schedule', async () => {
    const res = await api('get', '/appointments/doctor', doctorToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.appointments)).toBe(true);
  });

});

// ══════════════════════════════════════════════════════
// MODULE 5 — PRESCRIPTIONS
// ══════════════════════════════════════════════════════
describe('💊 MODULE 5 — Prescriptions', () => {

  test('TC-23 | Doctor can create a prescription', async () => {
    const res = await api('post', '/prescriptions', doctorToken).send({
      appointmentId: appointmentId,
      diagnosis: 'Stable Angina',
      medicines: [
        { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days', notes: 'Take after food' },
        { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once at night', duration: '30 days', notes: '' }
      ],
      labTests: ['ECG', 'Lipid Profile', 'CBC'],
      instructions: 'Avoid heavy exercise. Follow up in 2 weeks.',
      followUpDate: new Date(Date.now() + 14 * 86400000)
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.prescription.medicines.length).toBe(2);
    expect(res.body.prescription.labTests).toContain('ECG');
    prescriptionId = res.body.prescription._id;
  });

  test('TC-24 | Cannot create duplicate prescription for same appointment', async () => {
    const res = await api('post', '/prescriptions', doctorToken).send({
      appointmentId: appointmentId,
      diagnosis: 'Duplicate attempt',
      medicines: [],
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('TC-25 | Patient can view their prescriptions', async () => {
    const res = await api('get', '/prescriptions/my', patientToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.prescriptions.length).toBeGreaterThanOrEqual(1);
    expect(res.body.prescriptions[0].diagnosis).toBeDefined();
  });

  test('TC-26 | Doctor can view prescriptions they issued', async () => {
    const res = await api('get', '/prescriptions/doctor', doctorToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.prescriptions.length).toBeGreaterThanOrEqual(1);
  });

  test('TC-27 | Doctor can update a prescription', async () => {
    const res = await api('put', `/prescriptions/${prescriptionId}`, doctorToken).send({
      instructions: 'Updated: Avoid spicy food too. Follow up in 1 week.'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.prescription.instructions).toMatch(/Updated/);
  });

  test('TC-28 | Patient cannot create a prescription', async () => {
    const res = await api('post', '/prescriptions', patientToken).send({
      appointmentId: appointmentId, diagnosis: 'Self diagnosis', medicines: []
    });
    expect(res.statusCode).toBe(403);
  });

});

// ══════════════════════════════════════════════════════
// MODULE 6 — ADMIN
// ══════════════════════════════════════════════════════
describe('🛡️ MODULE 6 — Admin Panel', () => {

  beforeAll(async () => {
    // Create admin user directly
    const User = require('../server/models/User');
    const jwt  = require('jsonwebtoken');
    const admin = await User.create({
      name: 'Super Admin', email: 'admin@clinic.com', password: 'admin123', role: 'admin'
    });
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'testsecret');
  });

  test('TC-29 | Admin gets dashboard stats', async () => {
    const res = await api('get', '/admin/stats', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.stats).toHaveProperty('totalPatients');
    expect(res.body.stats).toHaveProperty('totalDoctors');
    expect(res.body.stats).toHaveProperty('totalAppointments');
    expect(res.body.stats).toHaveProperty('totalRevenue');
  });

  test('TC-30 | Admin can view all users', async () => {
    const res = await api('get', '/admin/users', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(3);
  });

  test('TC-31 | Admin can approve a pending doctor', async () => {
    // Register fresh unapproved doctor
    const regDoc = await api('post', '/auth/register').send({
      name: 'Dr. Pending', email: 'drpending@test.com', password: 'pass123',
      role: 'doctor', specialization: 'Neurology', qualification: 'MBBS', consultationFee: 2500
    });
    const Doctor = require('../server/models/Doctor');
    const doc = await Doctor.findOne({ user: regDoc.body.user.id });

    const res = await api('put', `/admin/doctors/${doc._id}/approve`, adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.doctor.isApproved).toBe(true);
  });

  test('TC-32 | Non-admin cannot access admin routes', async () => {
    const res = await api('get', '/admin/stats', patientToken);
    expect(res.statusCode).toBe(403);
  });

  test('TC-33 | Admin can toggle user active status', async () => {
    const usersRes = await api('get', '/admin/users', adminToken);
    const patient = usersRes.body.users.find(u => u.role === 'patient');
    const res = await api('put', `/admin/users/${patient._id}/toggle`, adminToken);
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.user.isActive).toBe('boolean');
  });

});