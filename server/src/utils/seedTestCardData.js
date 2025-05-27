const User = require('../models/User');
const CardDetail = require('../models/CardDetail');
const { encryptValue } = require('./secureCardUtils');
const connectDatabase = require('../config/db');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Function to seed test card data
const seedTestCardData = async () => {
  try {
    // Connect to database using the existing configuration
    await connectDatabase();
    
    console.log('Starting test card data seeding...');
    
    // Get all borrowers
    const borrowers = await User.find({ role: 'borrower' });
    
    if (borrowers.length === 0) {
      console.log('No borrowers found. Creating a test borrower...');
      
      // Create a test borrower
      const testBorrower = new User({
        name: 'Test Borrower',
        username: 'testborrower',
        email: 'test@example.com',
        password: 'password123',
        role: 'borrower',
        phone: '1234567890',
        cardNumber: '4111111111111111',
        cardName: 'TEST USER',
        validTil: '12/25'
      });
      
      await testBorrower.save();
      console.log('Created test borrower:', testBorrower._id);
      
      borrowers.push(testBorrower);
    }
    
    console.log(`Found ${borrowers.length} borrowers`);
    
    // Add test card details for each borrower
    let successCount = 0;
    
    for (const borrower of borrowers) {
      console.log(`Processing borrower: ${borrower.name} (${borrower._id})`);
      
      // Check if card details already exist
      const existingCardDetail = await CardDetail.findOne({ userId: borrower._id });
      
      if (existingCardDetail) {
        console.log('Card details already exist for this borrower, updating...');
        
        // Update with new test values
        existingCardDetail.encryptedCvv = encryptValue('123');
        existingCardDetail.encryptedAtmPin = encryptValue('4567');
        
        await existingCardDetail.save();
        console.log('Updated card details');
      } else {
        console.log('Creating new card details for borrower...');
        
        // Create new card details
        const newCardDetail = new CardDetail({
          userId: borrower._id,
          encryptedCvv: encryptValue('123'),
          encryptedAtmPin: encryptValue('4567')
        });
        
        await newCardDetail.save();
        console.log('Created new card details');
      }
      
      successCount++;
    }
    
    console.log(`Successfully seeded card details for ${successCount} borrowers`);
    
    return {
      success: true,
      message: `Seeded test card data for ${successCount} borrowers`
    };
  } catch (error) {
    console.error('Error seeding test card data:', error);
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the seeder if this script is executed directly
if (require.main === module) {
  seedTestCardData()
    .then(result => {
      console.log('Seeding result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding error:', error);
      process.exit(1);
    });
}

module.exports = { seedTestCardData }; 