const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Activity action is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  // For lender-borrower relationship tracking
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['auth', 'loan', 'payment', 'system'],
    default: 'system'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
});

// Create indexes for faster querying
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ relatedUser: 1, timestamp: -1 });
activityLogSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 