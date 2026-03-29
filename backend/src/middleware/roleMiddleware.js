// src/middleware/roleMiddleware.js

import { ROLES, ROLE_PERMISSIONS } from '../constants/roles.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';

// ✅ AUTHORIZE ROLES (FINAL VERSION)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.'
      });
    }

    // 🔥 FIX: Get role from multiple sources (safe fallback)
    const role = req.user.role || req.userType;

    console.log("🔐 ROLE CHECK:", role);
    console.log("✅ ALLOWED ROLES:", roles);

    if (!role) {
      return res.status(401).json({
        success: false,
        message: 'Role missing in request'
      });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// ✅ PERMISSION CHECK (FINAL VERSION)
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.'
      });
    }

    const role = req.user.role || req.userType;

    if (!role) {
      return res.status(401).json({
        success: false,
        message: 'Role missing in request'
      });
    }

    // 🔥 Super admin full access
    if (role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes(permission) && !permissions.includes('manage_all')) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to perform this action. Required: ${permission}`
      });
    }

    next();
  };
};

// ✅ TEACHER OWNERSHIP CHECK (FINAL VERSION)
export const checkTeacherOwnership = (modelName, idParam) => {
  return async (req, res, next) => {
    try {
      const role = req.user.role || req.userType;

      // 🔥 Admins skip ownership check
      if (role === 'super_admin' || role === 'admin') {
        return next();
      }

      if (role !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'Only teachers can access this resource'
        });
      }

      const resourceId = req.params[idParam];

      // ✅ STUDENT CHECK
      if (modelName === 'Student') {
        const student = await Student.findById(resourceId).populate('batch');

        if (!student) {
          return res.status(404).json({
            success: false,
            message: 'Student not found'
          });
        }

        const teacherBatches = req.user.teacherDetails?.assignedBatches || [];

        if (!teacherBatches.includes(student.batch?._id?.toString())) {
          return res.status(403).json({
            success: false,
            message: 'You can only access students from your assigned batches'
          });
        }
      }

      // ✅ BATCH CHECK
      if (modelName === 'Batch') {
        const teacherBatches = req.user.teacherDetails?.assignedBatches || [];

        if (!teacherBatches.includes(resourceId)) {
          return res.status(403).json({
            success: false,
            message: 'You can only access batches assigned to you'
          });
        }
      }

      next();

    } catch (error) {
      console.error('Teacher ownership check error:', error);

      return res.status(500).json({
        success: false,
        message: 'Server error in permission check'
      });
    }
  };
};