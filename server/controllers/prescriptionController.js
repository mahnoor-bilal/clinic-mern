const Prescription = require('../models/Prescription');
const Appointment  = require('../models/Appointment');

// POST /api/prescriptions  (doctor creates)
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, labTests, instructions, followUpDate } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.doctor.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can prescribe' });
    if (appointment.status !== 'completed' && appointment.status !== 'confirmed')
      return res.status(400).json({ success: false, message: 'Can only prescribe for confirmed/completed appointments' });

    // One prescription per appointment
    const existing = await Prescription.findOne({ appointment: appointmentId });
    if (existing) return res.status(400).json({ success: false, message: 'Prescription already exists for this appointment' });

    const prescription = await Prescription.create({
      appointment: appointmentId,
      doctor:  req.user.id,
      patient: appointment.patient,
      diagnosis,
      medicines: medicines || [],
      labTests:  labTests  || [],
      instructions,
      followUpDate
    });

    await prescription.populate([
      { path: 'doctor',  select: 'name email' },
      { path: 'patient', select: 'name email' }
    ]);

    res.status(201).json({ success: true, prescription });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/my  (patient's own)
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate('doctor', 'name email')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/doctor  (doctor's issued)
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.user.id })
      .populate('patient', 'name email')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/prescriptions/:id
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor',  'name email')
      .populate('patient', 'name email')
      .populate('appointment', 'date timeSlot reason');
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    const isOwner = prescription.patient._id.toString() === req.user.id ||
                    prescription.doctor._id.toString()  === req.user.id ||
                    req.user.role === 'admin';
    if (!isOwner) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/prescriptions/:id
exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.doctor.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only the prescribing doctor can update' });

    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('doctor', 'name email').populate('patient', 'name email');
    res.json({ success: true, prescription: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
