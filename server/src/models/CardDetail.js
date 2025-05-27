const mongoose = require('mongoose');

// Define a schema for encrypted card details
const cardDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Store encrypted values
  encryptedCvv: {
    type: String,
    select: false // Hide by default for security
  },
  encryptedAtmPin: {
    type: String,
    select: false // Hide by default for security
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on document save
cardDetailSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CardDetail', cardDetailSchema); 