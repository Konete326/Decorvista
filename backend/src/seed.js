require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('./models/User');
const Category = require('./models/Category');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
};

const seedCategories = async () => {
  const categories = [
    { name: 'Living Room', description: 'Furniture and decor for living spaces' },
    { name: 'Bedroom', description: 'Bedroom furniture and accessories' },
    { name: 'Kitchen', description: 'Kitchen appliances and accessories' },
    { name: 'Dining Room', description: 'Dining furniture and tableware' },
    { name: 'Office', description: 'Home office furniture and equipment' },
    { name: 'Bathroom', description: 'Bathroom fixtures and accessories' },
    { name: 'Outdoor', description: 'Outdoor furniture and garden decor' },
    { name: 'Lighting', description: 'Lamps, fixtures, and lighting solutions' },
    { name: 'Decor', description: 'Decorative items and artwork' },
    { name: 'Storage', description: 'Storage solutions and organizers' }
  ];

  for (const categoryData of categories) {
    const existing = await Category.findOne({ name: categoryData.name });
    if (!existing) {
      await Category.create({
        ...categoryData,
        slug: categoryData.name.toLowerCase().replace(/\s+/g, '-')
      });
      console.log(`Created category: ${categoryData.name}`);
    }
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const adminData = {
        name: 'Admin User',
        email: 'admin@decorvista.com',
        password: 'admin123',
        role: 'admin'
      };

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminData.password, salt);
      adminData.passwordHash = passwordHash;
      delete adminData.password;

      const admin = await User.create(adminData);
      console.log('Admin user created successfully:', admin.email);
    }

    await seedCategories();
    console.log('Seeding completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedAdmin();
