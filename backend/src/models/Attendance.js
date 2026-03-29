import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
    index: true
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'holiday'],
    required: true,
    default: 'absent'
  },
  
  checkInTime: {
    type: String
  },
  
  checkOutTime: {
    type: String
  },
  
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  remarks: {
    type: String
  }
  
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ studentId: 1, date: 1, batchId: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;