const express = require('express');
const router = express.Router();
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');
const { migrateCardDetails, importCardDetailsFromFile } = require('../utils/migrateCardDetails');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only accept JSON files
    if (file.mimetype !== 'application/json') {
      return cb(new Error('Only JSON files are allowed'), false);
    }
    cb(null, true);
  }
});

// Admin-only routes
router.use(isAuthenticated, authorizeRoles('admin'));

// Trigger card details migration
router.post('/migrate-card-details', async (req, res) => {
  try {
    const result = await migrateCardDetails();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Migration completed successfully: ${result.migratedCount} migrated, ${result.skippedCount} skipped`,
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Migration failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in migration endpoint:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Import card details from JSON file
router.post('/import-card-details', upload.single('cardDetailsFile'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Import the card details
    const result = await importCardDetailsFromFile(req.file.path);
    
    // Delete the temporary file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Error deleting temporary file:', err);
      }
    });
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Import completed successfully: ${result.importedCount} imported, ${result.skippedCount} skipped, ${result.errorCount} errors`,
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Import failed',
        error: result.error
      });
    }
  } catch (error) {
    // Clean up temporary file in case of error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    
    console.error('Error in import endpoint:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router; 