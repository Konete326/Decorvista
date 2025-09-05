const mongoose = require('mongoose');

const designerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  specialties: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  portfolio: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot exceed 200 characters']
    }
  }],
  availabilitySlots: [{
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
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available'
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  professionalTitle: {
    type: String,
    trim: true
  },
  hourlyRate: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

designerSchema.index({ user: 1 });
designerSchema.index({ specialties: 1 });
designerSchema.index({ location: 1 });

module.exports = mongoose.model('Designer', designerSchema);
