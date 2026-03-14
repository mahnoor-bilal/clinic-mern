const Doctor = require('../models/Doctor');
const User = require('../models/User');

// GET /api/doctors  (public)
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const filter = { isApproved: true };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };

    let doctors = await Doctor.find(filter).populate('user', 'name email phone');

    if (search) {
      doctors = doctors.filter(d =>
        d.user.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
      );
    }
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/me  (doctor's own profile)
exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email phone');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/doctors/me
exports.updateMyProfile = async (req, res) => {
  try {
    const { specialization, qualification, experience, consultationFee, bio, availableSlots } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      { specialization, qualification, experience, consultationFee, bio, availableSlots },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const daySlots = doctor.availableSlots.filter(s => s.day === dayName);

    if (daySlots.length === 0) return res.json({ success: true, slots: [], message: 'Doctor not available on this day' });

    // Get booked appointments for that date
    const Appointment = require('../models/Appointment');
    const booked = await Appointment.find({
      doctor: doctor.user,
      date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) },
      status: { $ne: 'cancelled' }
    });

    const bookedTimes = booked.map(a => a.timeSlot.start);

    // Generate 30-min slots from doctor's working hours
    const slots = [];
    daySlots.forEach(({ startTime, endTime }) => {
      let [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      while (sh * 60 + sm < eh * 60 + em) {
        const slotStart = `${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}`;
        sm += 30;
        if (sm >= 60) { sh++; sm -= 60; }
        const slotEnd = `${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}`;
        slots.push({ start: slotStart, end: slotEnd, isBooked: bookedTimes.includes(slotStart) });
      }
    });

    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
