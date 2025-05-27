const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { Parser } = require('json2csv');

// Get all activity logs (admin only)
router.get(
  '/',
  isAuthenticated,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const logs = await ActivityLog.find()
        .sort({ timestamp: -1 })
        .populate('user', 'name username email role')
        .populate('relatedUser', 'name username email role');

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
);

// Get all lenders for activity log view (admin only)
router.get(
  '/lenders',
  isAuthenticated,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const lenders = await User.find({ role: 'lender' })
        .select('name username email status _id profilePicture');

      res.status(200).json({
        success: true,
        count: lenders.length,
        data: lenders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
);

// Get lender statistics (admin only)
router.get(
  '/lender-stats/:lenderId',
  isAuthenticated,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { lenderId } = req.params;
      
      // Get all borrowers associated with this lender from activity logs
      // This is a simplified approach assuming borrowers have activities with lenders
      const borrowerIds = await ActivityLog.distinct('user', {
        relatedUser: new mongoose.Types.ObjectId(lenderId),
        'user.role': 'borrower'
      });
      
      // Count unique borrowers
      const totalBorrowers = borrowerIds.length;
      
      // Count loan-related activities (type: 'loan')
      const totalLoans = await ActivityLog.countDocuments({
        $or: [
          { user: new mongoose.Types.ObjectId(lenderId) },
          { relatedUser: new mongoose.Types.ObjectId(lenderId) }
        ],
        type: 'loan'
      });
      
      // Calculate total amount from loan activities
      // Assuming loan amount is stored in metadata.amount field
      const loanActivities = await ActivityLog.find({
        $or: [
          { user: new mongoose.Types.ObjectId(lenderId) },
          { relatedUser: new mongoose.Types.ObjectId(lenderId) }
        ],
        type: 'loan',
        'metadata.amount': { $exists: true }
      });
      
      let totalAmount = 0;
      loanActivities.forEach(activity => {
        if (activity.metadata && activity.metadata.amount) {
          totalAmount += parseFloat(activity.metadata.amount);
        }
      });
      
      res.status(200).json({
        success: true,
        data: {
          totalBorrowers,
          totalLoans,
          totalAmount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
);

// Get activity logs for a specific lender (admin only)
router.get(
  '/lender/:lenderId',
  isAuthenticated,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { lenderId } = req.params;
      const { startDate, endDate } = req.query;
      
      // Build query with date filters if provided
      const query = { 
        $or: [
          { user: new mongoose.Types.ObjectId(lenderId) },
          { relatedUser: new mongoose.Types.ObjectId(lenderId) }
        ] 
      };
      
      if (startDate && endDate) {
        query.timestamp = { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        };
      }

      // Get lender's logs and logs where lender is related
      const logs = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .populate('user', 'name username email role')
        .populate('relatedUser', 'name username email role');

      // Get all borrowers associated with this lender
      // In a real app, you'd have a specific relationship model
      // This is a simplified approach assuming borrowers have activities with lenders
      const borrowerIds = await ActivityLog.distinct('user', {
        relatedUser: new mongoose.Types.ObjectId(lenderId),
        'user.role': 'borrower'
      });
      
      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
        borrowerIds
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
);

// Get activity logs for a specific date range (admin or lender)
router.get(
  '/date-range',
  isAuthenticated,
  authorizeRoles('admin', 'lender'),
  async (req, res) => {
    try {
      const { startDate, endDate, userId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // Build query
      const query = {};
      
      // If user ID is provided, filter by that user
      if (userId) {
        query.$or = [
          { user: userId },
          { relatedUser: userId }
        ];
      } else if (req.user.role === 'lender') {
        // If lender, show only their logs and related borrowers
        query.$or = [
          { user: req.user.id },
          { relatedUser: req.user.id }
        ];
      }
      
      // Add date range filter
      query.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };

      const logs = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .populate('user', 'name username email role')
        .populate('relatedUser', 'name username email role');

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
);

// Create a new activity log entry
router.post(
  '/',
  isAuthenticated,
  async (req, res) => {
    try {
      const { action, description, relatedUser, type, metadata } = req.body;
      
      // Validate type field to ensure it's one of the valid enum values
      const validTypes = ['auth', 'loan', 'payment', 'system'];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid type value. Must be one of: ${validTypes.join(', ')}`
        });
      }
      
      const log = await ActivityLog.create({
        action,
        description,
        user: req.user.id,
        relatedUser,
        type: type || 'system', // Default to 'system' if not provided
        metadata
      });

      res.status(201).json({
        success: true,
        data: log
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
);

// Export activity logs for a specific lender (admin only)
router.get(
  '/export/:lenderId',
  isAuthenticated,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { lenderId } = req.params;
      const { startDate, endDate, format = 'csv' } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // Build query
      const query = { 
        $or: [
          { user: new mongoose.Types.ObjectId(lenderId) },
          { relatedUser: new mongoose.Types.ObjectId(lenderId) }
        ],
        timestamp: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        }
      };

      // Get lender's logs and logs where lender is related
      const logs = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .populate('user', 'name username email role')
        .populate('relatedUser', 'name username email role');

      if (format.toLowerCase() === 'csv') {
        // Format data for CSV export
        const formattedLogs = logs.map(log => ({
          Action: log.action,
          Description: log.description || '',
          Type: log.type,
          Timestamp: new Date(log.timestamp).toLocaleString(),
          User: log.user ? `${log.user.name} (${log.user.role})` : 'Unknown',
          RelatedUser: log.relatedUser ? `${log.relatedUser.name} (${log.relatedUser.role})` : 'None'
        }));

        // Configure CSV parser
        const fields = ['Action', 'Description', 'Type', 'Timestamp', 'User', 'RelatedUser'];
        const opts = { fields };
        const parser = new Parser(opts);
        
        // Generate CSV
        const csv = parser.parse(formattedLogs);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=activity_logs_${lenderId}_${new Date().toISOString().split('T')[0]}.csv`);
        
        // Send CSV response
        return res.status(200).send(csv);
      }

      // Default response if not CSV
      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  }
);

module.exports = router; 