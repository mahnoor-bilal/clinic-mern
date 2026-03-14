# 🏥 MediCare — Clinic Appointment Booking System (MERN)

A full-stack clinic management platform built with MongoDB, Express, React, and Node.js.

---

## 📁 Project Structure

```
clinic-mern/
├── server/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── prescriptionController.js
│   │   └── adminController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   └── Prescription.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── patients.js
│   │   ├── appointments.js
│   │   ├── prescriptions.js
│   │   └── admin.js
│   └── index.js
├── client/
│   └── src/
│       ├── components/Navbar.js
│       ├── context/AuthContext.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DoctorsPage.js
│       │   ├── DoctorDetail.js
│       │   ├── BookAppointment.js
│       │   ├── PatientDashboard.js
│       │   ├── DoctorDashboard.js
│       │   ├── AdminDashboard.js
│       │   └── PrescriptionView.js
│       └── utils/api.js
├── tests/
│   └── clinic.test.js      ← 33 test cases
├── package.json
└── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Install server dependencies
npm install

# 2. Install client dependencies
cd client && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET

# 4. Run both server and client
npm run dev
```

- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000

---

## 🧪 Running Tests

```bash
npm test
```

Uses **in-memory MongoDB** — no real database needed. All 33 tests run automatically.

---

## 👥 Roles & Access

| Role    | Permissions |
|---------|-------------|
| Patient | Register, book appointments, view prescriptions, manage health profile |
| Doctor  | View schedule, confirm/complete appointments, create prescriptions, set availability |
| Admin   | Approve/reject doctors, manage all users, view all appointments & stats |

### Create Admin Account
Register normally, then in MongoDB:
```js
db.users.updateOne({ email: "admin@clinic.com" }, { $set: { role: "admin" } })
```
Or use **MongoDB Compass** to update the role field.

---

## 📦 Modules (6 Modules)

### Module 1 — Auth & Registration
- Patient/doctor registration with auto profile creation
- JWT login with role-based protected routes
- Doctor registration requires admin approval

### Module 2 — Doctors
- Public doctor listing with search and filter
- 30-minute slot generation from availability schedule
- Real-time slot availability (booked slots marked)

### Module 3 — Patients
- Full health profile: blood group, allergies, medical history
- Emergency contact storage
- Profile accessible to assigned doctors and admin

### Module 4 — Appointments
- Conflict detection (prevents double-booking)
- Status workflow: pending → confirmed → completed
- Patient/doctor cancellation with reason
- Fee auto-set from doctor's consultation fee

### Module 5 — Prescriptions
- One prescription per appointment
- Multiple medicines with dosage/frequency/duration
- Lab test recommendations
- Follow-up date tracking
- Printable prescription view

### Module 6 — Admin Panel
- Doctor approval/rejection workflow
- User activation/deactivation
- Revenue stats dashboard
- Full appointment log

---

## 🧪 Test Cases (33 total)

| TC | Module | Description |
|----|--------|-------------|
| TC-01 | Auth | Register patient |
| TC-02 | Auth | Register doctor |
| TC-03 | Auth | Reject duplicate email |
| TC-04 | Auth | Login with valid credentials |
| TC-05 | Auth | Reject wrong password |
| TC-06 | Auth | Get protected profile |
| TC-07 | Auth | Block unauthenticated access |
| TC-08 | Doctors | Get list of approved doctors |
| TC-09 | Doctors | Doctor updates own profile |
| TC-10 | Doctors | Patient cannot update doctor profile |
| TC-11 | Doctors | Get available time slots |
| TC-12 | Patients | Update health profile |
| TC-13 | Patients | View own profile |
| TC-14 | Patients | Role guard on patient routes |
| TC-15 | Appointments | Patient books appointment |
| TC-16 | Appointments | Prevent double-booking same slot |
| TC-17 | Appointments | Cannot book unapproved doctor |
| TC-18 | Appointments | Doctor confirms appointment |
| TC-19 | Appointments | Doctor completes appointment |
| TC-20 | Appointments | Cannot cancel completed appointment |
| TC-21 | Appointments | Patient views own appointments |
| TC-22 | Appointments | Doctor views schedule |
| TC-23 | Prescriptions | Doctor creates prescription |
| TC-24 | Prescriptions | Prevent duplicate prescription |
| TC-25 | Prescriptions | Patient views own prescriptions |
| TC-26 | Prescriptions | Doctor views issued prescriptions |
| TC-27 | Prescriptions | Doctor updates prescription |
| TC-28 | Prescriptions | Patient cannot create prescription |
| TC-29 | Admin | Dashboard stats |
| TC-30 | Admin | View all users |
| TC-31 | Admin | Approve pending doctor |
| TC-32 | Admin | Non-admin blocked from admin routes |
| TC-33 | Admin | Toggle user active status |

---

## 🔑 API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | User | Get profile |
| GET | /api/doctors | No | List approved doctors |
| GET | /api/doctors/:id/slots | No | Get available slots |
| PUT | /api/doctors/me | Doctor | Update doctor profile |
| GET | /api/patients/me | Patient | Get patient profile |
| PUT | /api/patients/me | Patient | Update health profile |
| POST | /api/appointments | Patient | Book appointment |
| GET | /api/appointments/my | Patient | My appointments |
| GET | /api/appointments/doctor | Doctor | Doctor's schedule |
| PUT | /api/appointments/:id/confirm | Doctor | Confirm appointment |
| PUT | /api/appointments/:id/complete | Doctor | Complete appointment |
| PUT | /api/appointments/:id/cancel | User | Cancel appointment |
| POST | /api/prescriptions | Doctor | Create prescription |
| GET | /api/prescriptions/my | Patient | My prescriptions |
| GET | /api/prescriptions/doctor | Doctor | Issued prescriptions |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/doctors/pending | Admin | Pending doctors |
| PUT | /api/admin/doctors/:id/approve | Admin | Approve doctor |
| GET | /api/admin/users | Admin | All users |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | CSS Variables, Plus Jakarta Sans font |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Testing | Jest + Supertest + mongodb-memory-server |
| Icons | react-icons |
| Notifications | react-toastify |
