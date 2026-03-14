// routes/patients.js
const express = require('express');
const r = express.Router();
const { getMyProfile, updateMyProfile, getAllPatients, getPatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
r.get('/me',   protect, authorize('patient'), getMyProfile);
r.put('/me',   protect, authorize('patient'), updateMyProfile);
r.get('/',     protect, authorize('admin', 'doctor'), getAllPatients);
r.get('/:id',  protect, authorize('admin', 'doctor'), getPatient);
module.exports = r;
