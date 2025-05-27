const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile,
  getAllLenders,
  updateUser,
  deleteUser,
  updateUserProfile,
  verifyPassword
} = require('../controllers/authController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { compareCardDetail, decryptValue } = require('../utils/secureCardUtils');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const CardDetail = require('../models/CardDetail');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

// Protected routes
router.get('/me', isAuthenticated, getUserProfile);
router.put('/profile/update', isAuthenticated, updateUserProfile);
router.post('/verify-password', isAuthenticated, verifyPassword);

// Admin routes
router.get('/lenders', isAuthenticated, authorizeRoles('admin'), getAllLenders);
router.put('/users/:id', isAuthenticated, authorizeRoles('admin'), updateUser);
router.delete('/users/:id', isAuthenticated, authorizeRoles('admin'), deleteUser);

// Verify card details securely
router.post('/verify-card-details', isAuthenticated, async (req, res) => {
  try {
    const { userId, field, value } = req.body;
    
    if (!userId || !field || !value) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    // Only allow verification of specific secure fields
    if (!['cvv', 'atmPin'].includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field for verification'
      });
    }
    
    // Authorization checks - users can only verify their own details or
    // admin/lenders can verify borrowers they created
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      // If not admin and not self, check if lender has relationship with borrower
      if (req.user.role === 'lender') {
        const hasRelationship = await ActivityLog.exists({
          user: req.user._id,
          relatedUser: userId,
          type: 'system',
          'metadata.action_type': 'borrower_created'
        });
        
        if (!hasRelationship) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to verify these details'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to verify these details'
        });
      }
    }
    
    // Find user and include the specific field we need to verify
    const user = await User.findById(userId).select(`+${field}`);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Compare the provided value with the stored hash
    const isMatch = await compareCardDetail(value, user[field]);
    
    return res.status(200).json({
      success: true,
      isMatch
    });
    
  } catch (error) {
    console.error('Error verifying card details:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Get complete card details with sensitive information
router.get('/borrower-card-details/:id', isAuthenticated, async (req, res) => {
  try {
    const borrowerId = req.params.id;
    console.log(`Fetching card details for borrower: ${borrowerId}`);
    
    // Authorization checks - users can only get their own details or
    // admin/lenders can get borrowers they created
    if (req.user.role !== 'admin' && req.user._id.toString() !== borrowerId) {
      // If not admin and not self, check if lender has relationship with borrower
      if (req.user.role === 'lender') {
        const hasRelationship = await ActivityLog.exists({
          user: req.user._id,
          relatedUser: borrowerId,
          type: 'system',
          'metadata.action_type': 'borrower_created'
        });
        
        if (!hasRelationship) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to view these details'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these details'
        });
      }
    }
    
    // Fetch borrower basic info
    const borrower = await User.findById(borrowerId);
    
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }
    
    // Initialize card details with non-sensitive data
    const cardDetails = {
      cardNumber: borrower.cardNumber || '',
      cardName: borrower.cardName || '',
      validTil: borrower.validTil || '',
      cvv: '',
      atmPin: ''
    };
    
    console.log('Basic card details:', {
      cardNumber: cardDetails.cardNumber ? 'Present' : 'Missing',
      cardName: cardDetails.cardName ? 'Present' : 'Missing',
      validTil: cardDetails.validTil ? 'Present' : 'Missing'
    });
    
    // Check if there are any encrypted card details from legacy hashed storage
    if (borrower.cvv || borrower.atmPin) {
      console.log('Found legacy hashed card details in user record');
      
      // For backward compatibility, try to include hashed values if they exist
      if (borrower.cvv) {
        cardDetails.cvv = 'Legacy hashed value - actual value unavailable';
      }
      
      if (borrower.atmPin) {
        cardDetails.atmPin = 'Legacy hashed value - actual value unavailable';
      }
    }
    
    // Get encrypted sensitive card details
    const secureCardDetail = await CardDetail.findOne({ userId: borrowerId }).select('+encryptedCvv +encryptedAtmPin');
    
    if (secureCardDetail) {
      console.log('Found encrypted card details', {
        hasCVV: !!secureCardDetail.encryptedCvv,
        hasATMPin: !!secureCardDetail.encryptedAtmPin
      });
      
      // Decrypt and add sensitive details
      if (secureCardDetail.encryptedCvv) {
        try {
          cardDetails.cvv = decryptValue(secureCardDetail.encryptedCvv) || '';
          console.log('Decrypted CVV:', cardDetails.cvv ? 'Success' : 'Failed');
        } catch (err) {
          console.error('Error decrypting CVV:', err);
          cardDetails.cvv = 'Error decrypting value';
        }
      }
      
      if (secureCardDetail.encryptedAtmPin) {
        try {
          cardDetails.atmPin = decryptValue(secureCardDetail.encryptedAtmPin) || '';
          console.log('Decrypted ATM PIN:', cardDetails.atmPin ? 'Success' : 'Failed');
        } catch (err) {
          console.error('Error decrypting ATM PIN:', err);
          cardDetails.atmPin = 'Error decrypting value';
        }
      }
    } else {
      console.log('No encrypted card details found in CardDetail collection');
      
      // For development purposes, always return test values to ensure UI displays properly
      console.log('Returning test values for development');
      cardDetails.cvv = '•••';
      cardDetails.atmPin = '••••';
    }
    
    // Ensure we always return data in expected format
    console.log('Returning final card details:', {
      cardNumber: cardDetails.cardNumber ? 'Present' : 'Missing',
      cardName: cardDetails.cardName ? 'Present' : 'Missing',
      validTil: cardDetails.validTil ? 'Present' : 'Missing',
      cvv: cardDetails.cvv ? 'Present' : 'Missing',
      atmPin: cardDetails.atmPin ? 'Present' : 'Missing'
    });
    
    res.status(200).json({
      success: true,
      data: cardDetails
    });
    
  } catch (error) {
    console.error('Error fetching card details:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// DEBUG ROUTE: Check and repair a borrower account by username
// This route helps diagnose and fix authentication issues
router.get('/check-borrower/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { password } = req.query;
    
    console.log(`Checking borrower account for: ${username}`);
    
    // Find the user account
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('+password');
    
    if (!user) {
      console.log(`User ${username} not found in database`);
      return res.status(404).json({
        success: false,
        message: `User ${username} not found`
      });
    }
    
    console.log(`Found user: ${user.username}, ID: ${user._id}, Role: ${user.role}`);
    console.log(`Password in DB exists: ${!!user.password}, Length: ${user.password ? user.password.length : 0}`);
    
    // Check if we need to fix the role
    if (user.role !== 'borrower') {
      console.log(`Fixing role: changing from "${user.role}" to "borrower"`);
      user.role = 'borrower';
      await user.save();
      console.log('Role updated successfully');
    }
    
    // Reset password if provided
    if (password) {
      console.log(`Resetting password to: ${password}`);
      user.password = password;
      await user.save();
      console.log('Password reset successfully');
      
      // Verify the password was saved correctly
      const updatedUser = await User.findById(user._id).select('+password');
      const isMatch = await bcrypt.compare(password, updatedUser.password);
      console.log(`Password verification after reset: ${isMatch ? 'Success' : 'Failed'}`);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Borrower account checked and repaired',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        passwordExists: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      }
    });
  } catch (error) {
    console.error('Error checking/repairing borrower account:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 