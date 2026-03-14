const express = require('express');
const r = express.Router();
const { getDoctors, getDoctor, getMyProfile, updateMyProfile, getAvailableSlots } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

r.get('/',          getDoctors);
r.get('/me',        protect, authorize('doctor'), getMyProfile);
r.put('/me',        protect, authorize('doctor'), updateMyProfile);
r.get('/:id',       getDoctor);
r.get('/:id/slots', getAvailableSlots);

module.exports = r;
