// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

// Protect routes - JWT verification
export const protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decoded);

    let user;

    // ✅ USE ROLE FROM TOKEN (BEST PRACTICE)
    if (decoded.role === 'student') {
      user = await Student.findById(decoded.id).select('-password');
    } else {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Invalid token.'
      });
    }

    // ✅ OPTIONAL: Fix status check for students
    if (decoded.role !== 'student' && user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: `Your account is ${user.status}`
      });
    }
    

    req.user = user;
    req.userType = decoded.role;

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    return res.status(401).json({
      success: false,
      message: 'Token failed'
    });
  }
};