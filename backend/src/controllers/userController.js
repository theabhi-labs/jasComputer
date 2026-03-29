import User from '../models/User.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';

class UserController extends BaseController {
  // Get all users with pagination and filtering
  getAllUsers = async (req, res) => {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const filter = { isDeleted: false };

      // Filter by role
      if (req.query.role) {
        filter.role = req.query.role;
      }

      // Filter by status
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // Search
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { phone: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(filter)
      ]);

      const pagination = this.getPaginationMetadata(total, page, limit);

      return this.success(res, { users, pagination });

    } catch (error) {
      console.error('Get users error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Get user by ID
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id)
        .select('-password')
        .lean();

      if (!user) {
        return this.error(res, 'User not found', 404);
      }

      return this.success(res, { user });

    } catch (error) {
      console.error('Get user error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Update user
  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove password from update data
      delete updateData.password;

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return this.error(res, 'User not found', 404);
      }

      return this.success(res, { user }, 'User updated successfully');

    } catch (error) {
      console.error('Update user error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Change user status
  changeUserStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).select('-password');

      if (!user) {
        return this.error(res, 'User not found', 404);
      }

      return this.success(res, { user }, `User status changed to ${status}`);

    } catch (error) {
      console.error('Change status error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Delete user (soft delete)
  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndUpdate(
        id,
        { isDeleted: true, status: 'inactive' },
        { new: true }
      );

      if (!user) {
        return this.error(res, 'User not found', 404);
      }

      return this.success(res, null, 'User deleted successfully');

    } catch (error) {
      console.error('Delete user error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };

  // Get teacher statistics
  getTeacherStats = async (req, res) => {
    try {
      const [total, active, inactive] = await Promise.all([
        User.countDocuments({ role: 'teacher', isDeleted: false }),
        User.countDocuments({ role: 'teacher', status: 'active', isDeleted: false }),
        User.countDocuments({ role: 'teacher', status: 'inactive', isDeleted: false })
      ]);

      // Get subject-wise distribution
      const subjectWise = await User.aggregate([
        { $match: { role: 'teacher', isDeleted: false } },
        { $unwind: '$teacherDetails.specialization' },
        { $group: { _id: '$teacherDetails.specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return this.success(res, {
        total,
        active,
        inactive,
        subjectWise
      });

    } catch (error) {
      console.error('Get teacher stats error:', error);
      return this.error(res, error.message || 'Server error', 500);
    }
  };
}

export default new UserController();