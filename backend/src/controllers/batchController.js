import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import BaseController from './baseController.js';
import { MESSAGES } from '../constants/messages.js';

class BatchController extends BaseController {
  // Get all batches
  getAllBatches = async (req, res) => {
    try {
      const { page, limit, skip } = this.getPaginationOptions(req.query);
      const filter = {};
      
      if (req.query.course) filter.course = req.query.course;
      if (req.query.status) filter.status = req.query.status;
      
      if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
      }
      
      // Teacher sees only their batches
      if (req.user.role === 'teacher') {
        filter._id = { $in: req.user.teacherDetails?.assignedBatches || [] };
      }
      
      const [batches, total] = await Promise.all([
        Batch.find(filter)
          .populate('course', 'name code')
          .populate('teachers', 'name email')
          .sort({ startDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Batch.countDocuments(filter)
      ]);
      
      const pagination = this.getPaginationMetadata(total, page, limit);
      
      return this.success(res, { batches, pagination });
      
    } catch (error) {
      console.error('Get batches error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Get single batch
  getBatchById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const batch = await Batch.findById(id)
        .populate('course', 'name code duration')
        .populate('teachers', 'name email phone')
        .lean();
      
      if (!batch) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      // Get students in this batch
      const students = await Student.find({ batch: id, status: 'active' })
        .select('name enrollmentNo phone email')
        .limit(100)
        .lean();
      
      return this.success(res, { batch, students });
      
    } catch (error) {
      console.error('Get batch error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Create batch
  createBatch = async (req, res) => {
    try {
      const batchData = req.body;
      
      // Check course exists
      const course = await Course.findById(batchData.course);
      if (!course) {
        return this.error(res, 'Course not found', 404);
      }
      
      batchData.createdBy = req.user._id;
      
      const batch = await Batch.create(batchData);
      
      // Assign teachers
      if (batchData.teachers && batchData.teachers.length) {
        await User.updateMany(
          { _id: { $in: batchData.teachers } },
          { $addToSet: { 'teacherDetails.assignedBatches': batch._id } }
        );
      }
      
      return this.success(res, { batch }, MESSAGES.SUCCESS.DATA_CREATED, 201);
      
    } catch (error) {
      console.error('Create batch error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Update batch
  updateBatch = async (req, res) => {
    try {
      const { id } = req.params;
      
      const batch = await Batch.findById(id);
      if (!batch) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      // Handle teacher assignment changes
      if (req.body.teachers) {
        const oldTeachers = batch.teachers.map(t => t.toString());
        const newTeachers = req.body.teachers;
        
        // Remove from old teachers not in new
        const toRemove = oldTeachers.filter(t => !newTeachers.includes(t));
        await User.updateMany(
          { _id: { $in: toRemove } },
          { $pull: { 'teacherDetails.assignedBatches': batch._id } }
        );
        
        // Add to new teachers
        const toAdd = newTeachers.filter(t => !oldTeachers.includes(t));
        await User.updateMany(
          { _id: { $in: toAdd } },
          { $addToSet: { 'teacherDetails.assignedBatches': batch._id } }
        );
      }
      
      Object.assign(batch, req.body);
      await batch.save();
      
      return this.success(res, { batch }, MESSAGES.SUCCESS.DATA_UPDATED);
      
    } catch (error) {
      console.error('Update batch error:', error);
      return this.error(res, error.message, 500);
    }
  };

  // Change batch status
  changeBatchStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const batch = await Batch.findById(id);
      if (!batch) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      batch.status = status;
      await batch.save();
      
      return this.success(res, { batch }, `Batch status changed to ${status}`);
      
    } catch (error) {
      console.error('Change status error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };

  // Delete batch
  deleteBatch = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if students exist
      const students = await Student.findOne({ batch: id });
      if (students) {
        return this.error(res, 'Cannot delete batch with enrolled students', 400);
      }
      
      const batch = await Batch.findByIdAndDelete(id);
      
      if (!batch) {
        return this.error(res, MESSAGES.ERROR.NOT_FOUND, 404);
      }
      
      // Remove batch from teachers
      await User.updateMany(
        { 'teacherDetails.assignedBatches': id },
        { $pull: { 'teacherDetails.assignedBatches': id } }
      );
      
      return this.success(res, null, MESSAGES.SUCCESS.DATA_DELETED);
      
    } catch (error) {
      console.error('Delete batch error:', error);
      return this.error(res, MESSAGES.ERROR.SERVER_ERROR, 500);
    }
  };
}

export default new BatchController();