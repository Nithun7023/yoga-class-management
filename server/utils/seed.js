/**
 * Database seeder — creates admin, instructor, member accounts
 * and sample yoga classes.
 * Run: node utils/seed.js
 */
require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const YogaClass = require('../models/YogaClass');
const MembershipPlan = require('../models/MembershipPlan');

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Instructor.deleteMany({}),
    YogaClass.deleteMany({}),
    MembershipPlan.deleteMany({}),
  ]);

  // Create users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@yoga.com',
    phone: '9876543210',
    passwordHash: 'Password123!',
    role: 'admin',
    status: 'active',
  });

  const instructorUser = await User.create({
    name: 'Priya Sharma',
    email: 'priya@yoga.com',
    phone: '9876543211',
    passwordHash: 'Password123!',
    role: 'instructor',
    status: 'active',
  });

  const instructorUser2 = await User.create({
    name: 'Arjun Mehta',
    email: 'arjun@yoga.com',
    phone: '9876543212',
    passwordHash: 'Password123!',
    role: 'instructor',
    status: 'active',
  });

  const member = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@yoga.com',
    phone: '9876543213',
    passwordHash: 'Password123!',
    role: 'member',
    status: 'active',
  });

  // Create instructor profiles
  await Instructor.create({
    userId: instructorUser._id,
    bio: 'Certified yoga instructor with 8 years of experience in Hatha and Vinyasa yoga.',
    specializations: ['Hatha', 'Vinyasa', 'Meditation'],
    experience: 8,
    status: 'active',
  });

  await Instructor.create({
    userId: instructorUser2._id,
    bio: 'Power Yoga and Ashtanga specialist with international certifications.',
    specializations: ['Ashtanga', 'Power Yoga', 'Yin'],
    experience: 5,
    status: 'active',
  });

  // Create membership plans
  await MembershipPlan.create([
    {
      name: 'Monthly Basic',
      duration: 30,
      price: 1500,
      classLimit: 12,
      description: 'Access to 12 classes per month. Perfect for beginners.',
      status: 'active',
    },
    {
      name: 'Monthly Unlimited',
      duration: 30,
      price: 2500,
      classLimit: null,
      description: 'Unlimited class access for one month.',
      status: 'active',
    },
    {
      name: 'Quarterly',
      duration: 90,
      price: 6000,
      classLimit: null,
      description: 'Three months of unlimited access with 20% savings.',
      status: 'active',
    },
    {
      name: 'Annual',
      duration: 365,
      price: 18000,
      classLimit: null,
      description: 'Full year unlimited access — best value.',
      status: 'active',
    },
  ]);

  // Create sample yoga classes
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);

  await YogaClass.create([
    {
      name: 'Morning Hatha Flow',
      type: 'Hatha',
      description: 'A gentle morning flow to awaken the body and mind.',
      difficulty: 'Beginner',
      focusArea: ['Flexibility', 'Relaxation'],
      instructorId: instructorUser._id,
      room: 'Studio A',
      date: today,
      startTime: '07:00',
      endTime: '08:00',
      duration: 60,
      capacity: 15,
      status: 'scheduled',
    },
    {
      name: 'Power Vinyasa',
      type: 'Vinyasa',
      description: 'A dynamic, strength-building vinyasa class.',
      difficulty: 'Intermediate',
      focusArea: ['Strength', 'Core'],
      instructorId: instructorUser2._id,
      room: 'Studio B',
      date: today,
      startTime: '18:00',
      endTime: '19:00',
      duration: 60,
      capacity: 20,
      status: 'scheduled',
    },
    {
      name: 'Yin & Restore',
      type: 'Yin',
      description: 'Deep tissue release and passive stretching.',
      difficulty: 'Beginner',
      focusArea: ['Flexibility', 'Stress Relief'],
      instructorId: instructorUser._id,
      room: 'Studio A',
      date: tomorrow,
      startTime: '09:00',
      endTime: '10:30',
      duration: 90,
      capacity: 12,
      status: 'scheduled',
    },
    {
      name: 'Ashtanga Primary Series',
      type: 'Ashtanga',
      description: 'Traditional Ashtanga primary series — a challenging practice.',
      difficulty: 'Advanced',
      focusArea: ['Strength', 'Flexibility', 'Balance'],
      instructorId: instructorUser2._id,
      room: 'Studio B',
      date: dayAfter,
      startTime: '06:30',
      endTime: '08:00',
      duration: 90,
      capacity: 10,
      status: 'scheduled',
    },
  ]);

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('🔑 Test Accounts:');
  console.log('  Admin:      admin@yoga.com / Password123!');
  console.log('  Instructor: priya@yoga.com / Password123!');
  console.log('  Instructor: arjun@yoga.com / Password123!');
  console.log('  Member:     rahul@yoga.com / Password123!');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
