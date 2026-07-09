import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });

const email = process.argv[2] || 'admin@jascomputer.com';
const password = process.argv[3] || 'Admin@123';
const name = process.argv[4] || 'Admin';

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`Updated existing user to admin: ${email}`);
      } else {
        console.log(`Admin already exists: ${email}`);
      }
      await mongoose.disconnect();
      return;
    }

    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin created successfully: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
