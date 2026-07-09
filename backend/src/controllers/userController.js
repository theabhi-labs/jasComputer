import mongoose from 'mongoose';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const login = async (req, res) => {
  const normalizedEmail = req.body.email?.toLowerCase()?.trim();

  try {
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[LOGIN] Missing JWT_SECRET environment variable');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact support.',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('[LOGIN] Database not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Please try again.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.warn('[LOGIN] User not found:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.role !== 'admin') {
      console.warn('[LOGIN] Non-admin login attempt:', normalizedEmail, 'role:', user.role);
      return res.status(403).json({
        success: false,
        message: 'Admin access only',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('[LOGIN] Invalid password for:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id, user.role);

    console.info('[LOGIN] Admin login successful:', normalizedEmail);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[LOGIN] Unexpected error:', {
      email: normalizedEmail,
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message }),
    });
  }
};