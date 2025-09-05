const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  homeowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designer',
    required: true
  },
  slot: {
    date: {
      type: Date,
      required: true
    },
    from: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format']
    },
    to: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

consultationSchema.index({ homeowner: 1 });
consultationSchema.index({ designer: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ 'slot.date': 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
