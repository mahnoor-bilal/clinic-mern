const express = require('express');
const r = express.Router();
const {
  bookAppointment, getMyAppointments, getDoctorAppointments,
  getAppointment, confirmAppointment, completeAppointment,
  cancelAppointment, getAllAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

r.post('/',              protect, authorize('patient'),        bookAppointment);
r.get('/my',             protect, authorize('patient'),        getMyAppointments);
r.get('/doctor',         protect, authorize('doctor'),         getDoctorAppointments);
r.get('/all',            protect, authorize('admin'),          getAllAppointments);
r.get('/:id',            protect,                              getAppointment);
r.put('/:id/confirm',    protect, authorize('doctor'),         confirmAppointment);
r.put('/:id/complete',   protect, authorize('doctor'),         completeAppointment);
r.put('/:id/cancel',     protect,                              cancelAppointment);

module.exports = r;
