import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    required: true,
    index: true
  },
  
  userModel: {
    type: String,
    enum: ['User', 'Student'],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'reminder'],
    default: 'info'
  },
  
  category: {
    type: String,
    enum: ['fee', 'attendance', 'certificate', 'batch', 'general', 'event'],
    default: 'general'
  },
  
  link: {
    type: String
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  isSent: {
    type: Boolean,
    default: false
  },
  
  sentAt: {
    type: Date
  },
  
  expiresAt: {
    type: Date
  }
  
}, {
  timestamps: true
});

// Mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;