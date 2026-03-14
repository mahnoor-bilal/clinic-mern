const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// POST /api/appointments  (patient books)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;

    // Check doctor exists & is approved
    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor || !doctor.isApproved)
      return res.status(404).json({ success: false, message: 'Doctor not found or not approved' });

    // Conflict check: same doctor, same date, same slot
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      'timeSlot.start': timeSlot.start,
      status: { $ne: 'cancelled' }
    });
    if (conflict) return res.status(409).json({ success: false, message: 'This time slot is already booked' });

    // Prevent same patient double-booking same day same doctor
    const sameDay = await Appointment.findOne({
      patient: req.user.id,
      doctor: doctorId,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) },
      status: { $ne: 'cancelled' }
    });
    if (sameDay) return res.status(400).json({ success: false, message: 'You already have an appointment with this doctor on this day' });

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      fee: doctor.consultationFee
    });

    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor',  select: 'name email phone' }
    ]);

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/my  (patient's own)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name email phone')
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/doctor  (doctor's schedule)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = { doctor: req.user.id };
    if (status) filter.status = status;
    if (date) {
      filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .sort({ date: 1, 'timeSlot.start': 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor',  'name email phone');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isOwner = appointment.patient._id.toString() === req.user.id ||
                    appointment.doctor._id.toString()  === req.user.id ||
                    req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/confirm  (doctor confirms)
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.doctor.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can confirm' });
    if (appointment.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending appointments can be confirmed' });

    appointment.status = 'confirmed';
    if (req.body.notes) appointment.notes = req.body.notes;
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/complete  (doctor marks complete)
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.doctor.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can complete' });
    if (appointment.status !== 'confirmed')
      return res.status(400).json({ success: false, message: 'Only confirmed appointments can be completed' });

    appointment.status = 'completed';
    appointment.isPaid  = true;
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const isOwner = appointment.patient.toString() === req.user.id ||
                    appointment.doctor.toString()  === req.user.id ||
                    req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (appointment.status === 'completed')
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });
    if (appointment.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'Appointment already cancelled' });

    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.cancelReason || 'No reason provided';
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/appointments  (admin all)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor',  'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
