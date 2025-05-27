const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hashCardDetail, needsHashing } = require('../utils/secureCardUtils');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [50, 'Name cannot exceed 50 characters'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Please enter your username'],
    unique: true,
    trim: true,
    minLength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'lender', 'borrower', 'referrer'],
    default: 'lender'
  },
  phone: {
    type: String,
    trim: true
  },
  dob: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  // Card details for borrower role
  cardNumber: {
    type: String,
    trim: true
  },
  cardName: {
    type: String,
    trim: true
  },
  validTil: {
    type: String,
    trim: true
  },
  cvv: {
    type: String,
    trim: true,
    select: false // Hide by default for security
  },
  atmPin: {
    type: String,
    trim: true,
    select: false // Hide by default for security
  },
  // For borrowers
  creditScore: {
    type: Number,
    default: 0
  },
  totalBorrowed: {
    type: Number,
    default: 0
  },
  activeLoans: {
    type: Number,
    default: 0
  },
  lastPayment: {
    type: Date
  },
  referrer: {
    type: String,
    trim: true
  },
  // For deleted users
  active: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Hash CVV if modified and not already hashed
  if (this.isModified('cvv') && this.cvv && needsHashing(this.cvv)) {
    console.log('Hashing CVV for user:', this._id);
    this.cvv = await hashCardDetail(this.cvv);
  }
  
  // Hash ATM PIN if modified and not already hashed
  if (this.isModified('atmPin') && this.atmPin && needsHashing(this.atmPin)) {
    console.log('Hashing ATM PIN for user:', this._id);
    this.atmPin = await hashCardDetail(this.atmPin);
  }
  
  next();
});

// Compare user password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('User', userSchema); 