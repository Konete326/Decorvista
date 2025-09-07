require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const testAdminLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' }).select('+passwordHash');
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Has passwordHash:', !!admin.passwordHash);

    // Test password comparison
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash);
    console.log('Password "admin123" is valid:', isValid);

    // Test the comparePassword method
    const methodValid = await admin.comparePassword(testPassword);
    console.log('Using comparePassword method:', methodValid);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdminLogin();
