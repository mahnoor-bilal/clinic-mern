const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dosage:    { type: String, required: true }, // "500mg"
  frequency: { type: String, required: true }, // "Twice daily"
  duration:  { type: String, required: true }, // "7 days"
  notes:     { type: String, default: '' }
});

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  doctor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis:   { type: String, required: true },
  medicines:   [medicineSchema],
  labTests:    [{ type: String }],
  instructions:{ type: String, default: '' },
  followUpDate:{ type: Date },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
