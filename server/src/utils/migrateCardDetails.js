const User = require('../models/User');
const CardDetail = require('../models/CardDetail');
const { encryptValue } = require('./secureCardUtils');
const fs = require('fs').promises;
const path = require('path');

/**
 * Migrate existing card details from users to encrypted storage
 * This is a utility function to run once to update the database
 */
const migrateCardDetails = async () => {
  try {
    console.log('Starting card details migration...');
    
    // Find all borrowers with either cvv or atmPin directly stored (not hashed yet)
    const borrowers = await User.find({
      role: 'borrower',
      $or: [
        { cvv: { $exists: true, $ne: null } },
        { atmPin: { $exists: true, $ne: null } }
      ]
    }).select('+cvv +atmPin');
    
    console.log(`Found ${borrowers.length} borrowers with card details to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const borrower of borrowers) {
      // Check if the card details are already hashed (bcrypt hash)
      const cvvIsHashed = borrower.cvv && borrower.cvv.startsWith('$2');
      const atmPinIsHashed = borrower.atmPin && borrower.atmPin.startsWith('$2');
      
      // Only migrate non-hashed values that contain actual data
      if ((!cvvIsHashed && borrower.cvv) || (!atmPinIsHashed && borrower.atmPin)) {
        // Check if encrypted details already exist
        let cardDetail = await CardDetail.findOne({ userId: borrower._id });
        
        if (!cardDetail) {
          cardDetail = new CardDetail({ userId: borrower._id });
        }
        
        // Encrypt non-hashed values
        if (!cvvIsHashed && borrower.cvv) {
          cardDetail.encryptedCvv = encryptValue(borrower.cvv);
        }
        
        if (!atmPinIsHashed && borrower.atmPin) {
          cardDetail.encryptedAtmPin = encryptValue(borrower.atmPin);
        }
        
        await cardDetail.save();
        
        // Clear the original values from the user record
        if (!cvvIsHashed && borrower.cvv) {
          borrower.cvv = undefined;
        }
        
        if (!atmPinIsHashed && borrower.atmPin) {
          borrower.atmPin = undefined;
        }
        
        await borrower.save();
        
        migratedCount++;
        console.log(`Migrated card details for borrower ${borrower._id}`);
      } else {
        skippedCount++;
        console.log(`Skipped borrower ${borrower._id} (already hashed or no values)`);
      }
    }
    
    console.log(`Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`);
    
    return {
      success: true,
      migratedCount,
      skippedCount
    };
  } catch (error) {
    console.error('Error during card details migration:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Import card details from a JSON file and store them encrypted
 * 
 * @param {string} filePath - Path to the JSON file with card details
 * @returns {Object} - Result of the import operation
 */
const importCardDetailsFromFile = async (filePath) => {
  try {
    console.log(`Importing card details from file: ${filePath}`);
    
    // Read and parse the JSON file
    const fileData = await fs.readFile(path.resolve(filePath), 'utf8');
    const cardData = JSON.parse(fileData);
    
    if (!Array.isArray(cardData)) {
      throw new Error('File should contain an array of card details');
    }
    
    console.log(`Found ${cardData.length} card records to import`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const record of cardData) {
      try {
        // Validate record has required fields
        if (!record.userId) {
          console.error('Record missing userId, skipping:', record);
          skippedCount++;
          continue;
        }
        
        // Find the user
        const user = await User.findById(record.userId);
        
        if (!user) {
          console.error(`User not found for ID: ${record.userId}, skipping`);
          skippedCount++;
          continue;
        }
        
        // Check if we have card details to import
        if (!record.cvv && !record.atmPin) {
          console.log(`No card details to import for user: ${user.name}`);
          skippedCount++;
          continue;
        }
        
        // Find or create card details record
        let cardDetail = await CardDetail.findOne({ userId: user._id });
        
        if (!cardDetail) {
          cardDetail = new CardDetail({ userId: user._id });
        }
        
        // Encrypt and store values
        if (record.cvv) {
          cardDetail.encryptedCvv = encryptValue(record.cvv);
        }
        
        if (record.atmPin) {
          cardDetail.encryptedAtmPin = encryptValue(record.atmPin);
        }
        
        await cardDetail.save();
        
        // Update user record to remove any plain text values
        if (user.cvv) {
          user.cvv = undefined;
          await user.save();
        }
        
        if (user.atmPin) {
          user.atmPin = undefined;
          await user.save();
        }
        
        importedCount++;
        console.log(`Imported card details for user: ${user.name}`);
      } catch (recordError) {
        console.error(`Error processing record:`, recordError);
        errorCount++;
      }
    }
    
    console.log(`Import complete: ${importedCount} imported, ${skippedCount} skipped, ${errorCount} errors`);
    
    return {
      success: true,
      importedCount,
      skippedCount,
      errorCount
    };
  } catch (error) {
    console.error('Error importing card details:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { 
  migrateCardDetails,
  importCardDetailsFromFile
}; 