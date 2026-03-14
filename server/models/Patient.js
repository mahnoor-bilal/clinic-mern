const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  bloodGroup:  { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'], default: 'Unknown' },
  address:     { type: String, default: '' },
  emergencyContact: {
    name:  { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  medicalHistory: [{ type: String }],
  allergies:      [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
