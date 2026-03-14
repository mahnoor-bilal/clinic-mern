const express = require('express');
const r = express.Router();
const {
  createPrescription, getMyPrescriptions, getDoctorPrescriptions,
  getPrescription, updatePrescription
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

r.post('/',          protect, authorize('doctor'),          createPrescription);
r.get('/my',         protect, authorize('patient'),         getMyPrescriptions);
r.get('/doctor',     protect, authorize('doctor'),          getDoctorPrescriptions);
r.get('/:id',        protect,                               getPrescription);
r.put('/:id',        protect, authorize('doctor'),          updatePrescription);

module.exports = r;
