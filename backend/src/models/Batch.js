import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  timing: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  }],
  
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date
  },
  
  capacity: {
    type: Number,
    default: 30,
    min: 1
  },
  
  currentStrength: {
    type: Number,
    default: 0
  },
  
  room: {
    type: String,
    default: ''
  },
  
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  description: {
    type: String
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Check if batch has available seats
batchSchema.methods.hasAvailableSeats = function() {
  return this.currentStrength < this.capacity;
};

// Get timing display
batchSchema.methods.getTimingDisplay = function() {
  return `${this.timing.startTime} - ${this.timing.endTime}`;
};

// Get days display
batchSchema.methods.getDaysDisplay = function() {
  return this.days.join(', ');
};

// Indexes
batchSchema.index({ course: 1 });
batchSchema.index({ status: 1 });
batchSchema.index({ startDate: 1 });

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;