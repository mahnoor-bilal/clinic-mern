import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetail from './pages/DoctorDetail';
import BookAppointment from './pages/BookAppointment';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrescriptionView from './pages/PrescriptionView';

const Guard = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/"                    element={<Home />} />
      <Route path="/login"               element={<LoginPage />} />
      <Route path="/register"            element={<RegisterPage />} />
      <Route path="/doctors"             element={<DoctorsPage />} />
      <Route path="/doctors/:id"         element={<DoctorDetail />} />
      <Route path="/book/:doctorId"      element={<Guard roles={['patient']}><BookAppointment /></Guard>} />
      <Route path="/dashboard"           element={<Guard roles={['patient']}><PatientDashboard /></Guard>} />
      <Route path="/doctor/dashboard"    element={<Guard roles={['doctor']}><DoctorDashboard /></Guard>} />
      <Route path="/admin"               element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
      <Route path="/prescriptions/:id"   element={<Guard><PrescriptionView /></Guard>} />
    </Routes>
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
      </Router>
    </AuthProvider>
  );
}
