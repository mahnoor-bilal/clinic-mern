const express = require('express');
const r = express.Router();
const {
  getStats, getPendingDoctors, approveDoctor,
  rejectDoctor, getAllUsers, toggleUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

r.use(protect, authorize('admin'));

r.get('/stats',                  getStats);
r.get('/doctors/pending',        getPendingDoctors);
r.put('/doctors/:id/approve',    approveDoctor);
r.put('/doctors/:id/reject',     rejectDoctor);
r.get('/users',                  getAllUsers);
r.put('/users/:id/toggle',       toggleUser);

module.exports = r;
