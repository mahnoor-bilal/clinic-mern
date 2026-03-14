const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  startTime: { type: String, required: true }, // "09:00"
  endTime:   { type: String, required: true }  // "17:00"
});

const doctorSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization:  { type: String, required: true },
  qualification:   { type: String, required: true },
  experience:      { type: Number, default: 0 },
  consultationFee: { type: Number, required: true },
  bio:             { type: String, default: '' },
  availableSlots:  [slotSchema],
  isApproved:      { type: Boolean, default: false },
  rating:          { type: Number, default: 0 },
  totalReviews:    { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
