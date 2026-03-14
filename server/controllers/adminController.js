const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, pendingDoctors, appointments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments({ isApproved: true }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isApproved: false }),
      Appointment.find({ status: { $ne: 'cancelled' } })
    ]);
    const totalRevenue = appointments.reduce((sum, a) => sum + (a.isPaid ? a.fee : 0), 0);
    res.json({ success: true, stats: { totalPatients, totalDoctors, totalAppointments, pendingDoctors, totalRevenue } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/doctors/pending
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false }).populate('user', 'name email phone createdAt');
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/approve
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true })
      .populate('user', 'name email');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/doctors/:id/reject
exports.rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    const user = await User.findById(doctor.user);
    user.isActive = false;
    await user.save();
    res.json({ success: true, message: 'Doctor rejected and account deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
