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
  console.log('Pre-save hook triggered for user:', this._id || 'new user');
  console.log('Is password modified:', this.isModified('password'));
  
  // Only hash password if it's modified
  if (this.isModified('password')) {
    console.log('Hashing password, original length:', this.password.length);
    console.log('Original password value:', this.password);
    try {
      // Force a consistent salt round to ensure passwords are hashed consistently
      this.password = await bcrypt.hash(this.password, 10);
      console.log('Password hashed successfully, new length:', this.password.length);
      console.log('Hashed password value:', this.password);
      
      // Double-check that the hash was created correctly
      const testCompare = await bcrypt.compare(this.password, this.password);
      console.log('Hash self-verification:', testCompare);
    } catch (error) {
      console.error('Error hashing password:', error);
      next(error);
      return;
    }
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
  try {
    console.log(`Comparing passwords for user: ${this._id}, username: ${this.username}`);
    console.log(`Password from DB exists: ${!!this.password}, length: ${this.password ? this.password.length : 0}`);
    console.log(`Entered password length: ${enteredPassword ? enteredPassword.length : 0}`);
    console.log(`DB password: "${this.password}"`);
    console.log(`Entered password: "${enteredPassword}"`);
    
    // Handle missing password cases
    if (!this.password) {
      console.log('Missing password in DB - cannot compare');
      return false;
    }
    
    if (!enteredPassword) {
      console.log('Missing entered password - cannot compare');
      return false;
    }
    
    // Try direct comparison first (for unhashed passwords or dev mode)
    if (this.password === enteredPassword) {
      console.log('WARNING: Password matched in raw form - password was not hashed properly!');
      // In development, let this pass but log the warning
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
    }
    
    // Now try proper bcrypt comparison
    let result = false;
    
    // Check if the password is a valid bcrypt hash
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      result = await bcrypt.compare(enteredPassword, this.password);
      console.log(`Standard bcrypt comparison result: ${result}`);
    } else {
      console.log('WARNING: Password in DB does not appear to be a valid bcrypt hash');
      
      // In development mode, try some fallbacks
      if (process.env.NODE_ENV === 'development') {
        // If not a valid hash, try hashing the entered password and comparing directly
        const hashedEnteredPassword = await bcrypt.hash(enteredPassword, 10);
        const directMatch = this.password === hashedEnteredPassword;
        console.log(`Direct hash comparison result: ${directMatch}`);
        
        if (directMatch) {
          result = true;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Generate JWT token
userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = mongoose.model('User', userSchema); 