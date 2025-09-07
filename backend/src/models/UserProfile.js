const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
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
  location: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  preferredStyles: [{
    type: String,
    trim: true
  }],
  roomTypes: [{
    type: String,
    trim: true
  }],
  preferences: {
    style: [{
      type: String,
      trim: true
    }],
    budget: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      }
    },
    roomTypes: [{
      type: String,
      trim: true
    }]
  },
  projectHistory: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    completedDate: Date,
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designer'
    },
    images: [String],
    budget: Number
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  socialLinks: {
    instagram: String,
    pinterest: String,
    website: String
  }
}, {
  timestamps: true
});

userProfileSchema.index({ user: 1 });
userProfileSchema.index({ location: 1 });
userProfileSchema.index({ 'preferences.style': 1 });
userProfileSchema.index({ preferredStyles: 1 });
userProfileSchema.index({ rating: -1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);
