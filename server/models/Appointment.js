const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:    { type: Date, required: true },
  timeSlot: {
    start: { type: String, required: true }, // "10:00"
    end:   { type: String, required: true }  // "10:30"
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  reason:      { type: String, required: true },
  notes:       { type: String, default: '' },
  cancelReason:{ type: String, default: '' },
  fee:         { type: Number, default: 0 },
  isPaid:      { type: Boolean, default: false }
}, { timestamps: true });

// Prevent double-booking: same doctor, same date+time
appointmentSchema.index({ doctor: 1, date: 1, 'timeSlot.start': 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
