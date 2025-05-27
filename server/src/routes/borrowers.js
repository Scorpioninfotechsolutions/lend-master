const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const CardDetail = require('../models/CardDetail');
const { hashCardDetail, needsHashing, encryptValue, decryptValue } = require('../utils/secureCardUtils');

// Get all borrowers (for admin and lenders)
router.get('/', isAuthenticated, authorizeRoles('admin', 'lender'), async (req, res) => {
  try {
    // Only return active borrowers with role 'borrower'
    const query = { 
      role: 'borrower', 
      active: { $ne: false } // Find borrowers where active is either true or not set
    };
    
    // If lender, only show borrowers related to this lender
    if (req.user.role === 'lender') {
      console.log('Fetching borrowers for lender:', req.user._id);
      
      // Find borrowers associated with this lender from activity logs
      // Updated to match the relationship as created in the POST route
      const borrowerIds = await ActivityLog.distinct('relatedUser', {
        user: req.user._id,
        type: 'system',
        'metadata.action_type': 'borrower_created'
      });
      
      console.log('Found borrower IDs:', borrowerIds);
      
      if (borrowerIds.length > 0) {
        query._id = { $in: borrowerIds };
      } else {
        // If no borrowers are associated, return empty array
        console.log('No borrowers found for lender:', req.user._id);
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
    }
    
    const borrowers = await User.find(query).select('-password');
    
    console.log(`Returning ${borrowers.length} active borrowers`);
    
    res.status(200).json({
      success: true,
      count: borrowers.length,
      data: borrowers
    });
  } catch (error) {
    console.error('Error fetching borrowers:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Get single borrower
router.get('/:id', isAuthenticated, authorizeRoles('admin', 'lender', 'borrower'), async (req, res) => {
  try {
    const borrower = await User.findById(req.params.id).select('-password');
    
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }
    
    // Check if borrower is active (except for the borrower viewing their own profile)
    if (borrower.active === false && req.user._id.toString() !== req.params.id) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found or has been deleted'
      });
    }
    
    // Check if borrower belongs to requesting lender (if lender)
    if (req.user.role === 'lender') {
      const hasRelationship = await ActivityLog.exists({
        user: req.user._id,
        relatedUser: req.params.id,
        type: 'system',
        'metadata.action_type': 'borrower_created'
      });
      
      if (!hasRelationship) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this borrower'
        });
      }
    }
    
    // Borrowers can only access their own profile
    if (req.user.role === 'borrower' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this borrower'
      });
    }
    
    res.status(200).json({
      success: true,
      data: borrower
    });
  } catch (error) {
    console.error('Error fetching single borrower:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Create new borrower
router.post('/', isAuthenticated, authorizeRoles('admin', 'lender'), async (req, res) => {
  try {
    console.log('Creating new borrower with data:', JSON.stringify(req.body, null, 2));
    
    // Check if user with this email or phone already exists
    const { email, phone, username, cvv, atmPin } = req.body;
    
    // Validation checks
    if (!email || !username || !phone) {
      console.error('Validation error: Missing required fields', { 
        email: !!email, 
        username: !!username, 
        phone: !!phone 
      });
      
      return res.status(400).json({
        success: false,
        message: 'Email, username and phone are required fields',
        errors: [
          !email ? 'Email is required' : null,
          !username ? 'Username is required' : null,
          !phone ? 'Phone is required' : null
        ].filter(Boolean)
      });
    }
    
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phone },
        { username }
      ]
    });
    
    if (existingUser) {
      let message = 'User already exists with ';
      if (existingUser.email === email) message += 'this email';
      else if (existingUser.phone === phone) message += 'this phone number';
      else if (existingUser.username === username) message += 'this username';
      
      console.error('User already exists', { email, phone, username });
      
      return res.status(400).json({
        success: false,
        message
      });
    }
    
    // Extract sensitive data
    const cardData = {
      cvv: req.body.cvv,
      atmPin: req.body.atmPin
    };
    
    // Create new borrower with role set to 'borrower'
    const borrowerData = {
      ...req.body,
      role: 'borrower',
      // Generate a temporary password or send invite link
      password: Math.random().toString(36).slice(-8)
    };
    
    console.log('Final borrower data (without password and sensitive card info):', {
      ...borrowerData,
      password: '[REDACTED]',
      cvv: borrowerData.cvv ? '[REDACTED]' : undefined,
      atmPin: borrowerData.atmPin ? '[REDACTED]' : undefined
    });
    
    // Store original CVV and ATM pin values for direct storage in User model
    const originalCvv = borrowerData.cvv;
    const originalAtmPin = borrowerData.atmPin;
    
    const borrower = await User.create(borrowerData);
    
    // If we have sensitive card details, store them encrypted separately
    if (cardData.cvv || cardData.atmPin) {
      console.log('Encrypting card details with ENCRYPTION_KEY. Key exists:', !!process.env.ENCRYPTION_KEY);
      
      // Update CVV and ATM pin directly using the save method to trigger the pre-save hooks
      if (originalCvv || originalAtmPin) {
        const borrowerToUpdate = await User.findById(borrower._id);
        if (originalCvv) borrowerToUpdate.cvv = originalCvv;
        if (originalAtmPin) borrowerToUpdate.atmPin = originalAtmPin;
        await borrowerToUpdate.save();
        console.log('Updated CVV and ATM pin in User document during creation');
      }
      
      // Test encryption
      const encryptedCvv = cardData.cvv ? encryptValue(cardData.cvv) : undefined;
      const encryptedAtmPin = cardData.atmPin ? encryptValue(cardData.atmPin) : undefined;
      
      console.log('Encryption results:', {
        cvvProvided: !!cardData.cvv,
        atmPinProvided: !!cardData.atmPin,
        encryptedCvvGenerated: !!encryptedCvv,
        encryptedAtmPinGenerated: !!encryptedAtmPin
      });
      
      const encryptedCardDetail = new CardDetail({
        userId: borrower._id,
        encryptedCvv: encryptedCvv,
        encryptedAtmPin: encryptedAtmPin
      });
      
      await encryptedCardDetail.save();
      console.log('Encrypted card details saved separately. CardDetail ID:', encryptedCardDetail._id);
    }
    
    try {
      // Create activity log for this new borrower-lender relationship
      if (req.user.role === 'lender') {
        await ActivityLog.create({
          user: req.user._id,
          relatedUser: borrower._id,
          type: 'system',
          action: 'created',
          description: 'Borrower created',
          metadata: {
            borrowerName: borrower.name,
            createdBy: req.user.name,
            action_type: 'borrower_created'
          }
        });
      }
    } catch (logError) {
      // If activity log creation fails, log it but don't fail the borrower creation
      console.error('Error creating activity log:', logError);
    }
    
    // Don't send password in response
    const borrowerResponse = borrower.toObject();
    delete borrowerResponse.password;
    delete borrowerResponse.cvv;
    delete borrowerResponse.atmPin;
    
    res.status(201).json({
      success: true,
      data: borrowerResponse,
      message: 'Borrower created successfully'
    });
  } catch (error) {
    console.error('Error creating borrower:', error);
    
    // Provide more specific error messages for common issues
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation error details:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Update borrower
router.put('/:id', isAuthenticated, authorizeRoles('admin', 'lender'), async (req, res) => {
  try {
    // Find borrower
    let borrower = await User.findById(req.params.id);
    
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }
    
    // Check if lender is authorized to update this borrower
    if (req.user.role === 'lender') {
      const hasRelationship = await ActivityLog.exists({
        user: req.user._id,
        relatedUser: req.params.id,
        type: 'system',
        'metadata.action_type': 'borrower_created'
      });
      
      if (!hasRelationship) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this borrower'
        });
      }
    }
    
    // Don't allow changing role
    const updateData = { ...req.body };
    delete updateData.role;
    delete updateData.password; // Don't update password through this route
    
    // Extract sensitive card details
    const cardData = {
      cvv: updateData.cvv,
      atmPin: updateData.atmPin
    };
    
    // Store original values for direct storage in User model
    const originalCvv = updateData.cvv;
    const originalAtmPin = updateData.atmPin;
    
    // Remove sensitive data from main update
    delete updateData.cvv;
    delete updateData.atmPin;
    
    // Handle sensitive card data separately
    if (cardData.cvv || cardData.atmPin) {
      try {
        console.log('Updating card details with ENCRYPTION_KEY. Key exists:', !!process.env.ENCRYPTION_KEY);
        
        // Find existing card detail or create new one
        let cardDetail = await CardDetail.findOne({ userId: borrower._id });
        
        // Test encryption
        const encryptedCvv = cardData.cvv ? encryptValue(cardData.cvv) : undefined;
        const encryptedAtmPin = cardData.atmPin ? encryptValue(cardData.atmPin) : undefined;
        
        console.log('Encryption results for update:', {
          cvvProvided: !!cardData.cvv,
          atmPinProvided: !!cardData.atmPin,
          encryptedCvvGenerated: !!encryptedCvv,
          encryptedAtmPinGenerated: !!encryptedAtmPin
        });
        
        if (cardDetail) {
          // Update existing card detail
          if (cardData.cvv) {
            cardDetail.encryptedCvv = encryptedCvv;
          }
          
          if (cardData.atmPin) {
            cardDetail.encryptedAtmPin = encryptedAtmPin;
          }
          
          await cardDetail.save();
          console.log('Updated existing card detail. CardDetail ID:', cardDetail._id);
        } else {
          // Create new card detail
          cardDetail = new CardDetail({
            userId: borrower._id,
            encryptedCvv: encryptedCvv,
            encryptedAtmPin: encryptedAtmPin
          });
          
          await cardDetail.save();
          console.log('Created new card detail. CardDetail ID:', cardDetail._id);
        }
      } catch (cardError) {
        console.error('Error saving encrypted card details:', cardError);
      }
    }
    
    // Update main borrower data
    borrower = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -cvv -atmPin');
    
    // Update CVV and ATM pin directly using the save method to trigger the pre-save hooks
    if (originalCvv || originalAtmPin) {
      const borrowerToUpdate = await User.findById(req.params.id);
      if (originalCvv) borrowerToUpdate.cvv = originalCvv;
      if (originalAtmPin) borrowerToUpdate.atmPin = originalAtmPin;
      await borrowerToUpdate.save();
      console.log('Updated CVV and ATM pin in User document');
    }
    
    try {
      // Log the activity
      await ActivityLog.create({
        user: req.user._id,
        relatedUser: borrower._id,
        type: 'system',
        action: 'updated',
        description: 'Borrower updated',
        metadata: {
          borrowerName: borrower.name,
          updatedBy: req.user.name,
          action_type: 'borrower_updated'
        }
      });
    } catch (logError) {
      // If activity log creation fails, log it but don't fail the borrower update
      console.error('Error creating activity log for update:', logError);
    }
    
    res.status(200).json({
      success: true,
      data: borrower,
      message: 'Borrower updated successfully'
    });
  } catch (error) {
    console.error('Error updating borrower:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Delete borrower
router.delete('/:id', isAuthenticated, authorizeRoles('admin', 'lender'), async (req, res) => {
  try {
    // Find borrower
    const borrower = await User.findById(req.params.id);
    
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found'
      });
    }
    
    // Check if lender is authorized to delete this borrower
    if (req.user.role === 'lender') {
      const hasRelationship = await ActivityLog.exists({
        user: req.user._id,
        relatedUser: req.params.id,
        type: 'system',
        'metadata.action_type': 'borrower_created'
      });
      
      if (!hasRelationship) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this borrower'
        });
      }
    }
    
    // Check for permanent deletion confirmation
    const { confirmation } = req.query;
    
    if (confirmation === 'delete') {
      // Permanently delete the borrower
      console.log(`Permanently deleting borrower: ${borrower._id} (${borrower.name})`);
      await User.findByIdAndDelete(req.params.id);
    } else {
      // Mark as inactive (soft delete)
      console.log(`Soft deleting borrower: ${borrower._id} (${borrower.name})`);
      await User.findByIdAndUpdate(req.params.id, { 
        active: false,
        deletedAt: new Date()
      });
    }
    
    try {
      // Log the activity
      await ActivityLog.create({
        user: req.user._id,
        relatedUser: req.params.id,
        type: 'system',
        action: 'deleted',
        description: confirmation === 'delete' ? 'Borrower permanently deleted' : 'Borrower marked as deleted',
        metadata: {
          borrowerName: borrower.name,
          deletedBy: req.user.name,
          action_type: 'borrower_deleted',
          permanent: confirmation === 'delete'
        }
      });
    } catch (logError) {
      // If activity log creation fails, log it but don't fail the borrower deletion
      console.error('Error creating activity log for deletion:', logError);
    }
    
    res.status(200).json({
      success: true,
      message: confirmation === 'delete' ? 
        'Borrower permanently deleted successfully' : 
        'Borrower deleted successfully',
      permanent: confirmation === 'delete'
    });
  } catch (error) {
    console.error('Error deleting borrower:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router; 