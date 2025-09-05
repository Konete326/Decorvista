const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['homeowner', 'designer', 'admin'],
    default: 'homeowner'
  },
  phone: {
    type: String,
    match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number']
  },
  avatarUrl: {
    type: String
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.generateJWTPayload = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role
  };
};

userSchema.methods.generateToken = function() {
  return jwt.sign(
    this.generateJWTPayload(),
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
