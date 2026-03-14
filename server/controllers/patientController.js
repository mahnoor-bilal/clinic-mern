const Patient = require('../models/Patient');

// GET /api/patients/me
exports.getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email phone');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/patients/me
exports.updateMyProfile = async (req, res) => {
  try {
    const { dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory, allergies } = req.body;
    const patient = await Patient.findOneAndUpdate(
      { user: req.user.id },
      { dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory, allergies },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');
    res.json({ success: true, patient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/patients  (admin only)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('user', 'name email phone isActive');
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/patients/:id  (admin/doctor)
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email phone');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
