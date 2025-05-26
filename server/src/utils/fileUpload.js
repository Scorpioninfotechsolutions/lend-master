const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Define paths for file uploads - using absolute paths to avoid confusion
const uploadsDir = path.resolve(__dirname, '../../uploads');
const profileUploadsDir = path.resolve(uploadsDir, 'profiles');

// Ensure directories exist with proper permissions
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    console.log('Created uploads directory:', uploadsDir);
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
}

if (!fs.existsSync(profileUploadsDir)) {
  try {
    fs.mkdirSync(profileUploadsDir, { recursive: true, mode: 0o755 });
    console.log('Created profile uploads directory:', profileUploadsDir);
  } catch (err) {
    console.error('Error creating profile uploads directory:', err);
  }
}

/**
 * Process profile picture upload - converts to webp format
 * @param {Object} fileData - File data from express-fileupload
 * @returns {Promise<string>} - Filename of processed image
 */
const processProfilePicture = async (fileData) => {
  try {
    if (!fileData) {
      throw new Error('No file data provided');
    }
    
    // Check file size
    const fileSizeInMB = fileData.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Generate unique filename
    const filename = `${uuidv4()}.webp`;
    const outputPath = path.join(profileUploadsDir, filename);
    const relativePath = `/uploads/profiles/${filename}`;
    
    // Get file data buffer
    let fileBuffer;
    
    // Handle different ways the file data might be available
    if (fileData.data) {
      fileBuffer = fileData.data;
    } else if (fileData.tempFilePath) {
      fileBuffer = fs.readFileSync(fileData.tempFilePath);
    } else {
      // As a fallback, try to access the buffer directly
      fileBuffer = Buffer.from(fileData.buffer || fileData);
    }
    
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Could not get file data buffer');
    }
    
    // Process image with sharp (resize and convert to webp)
    try {
      await sharp(fileBuffer)
        .resize({
          width: 300,
          height: 300,
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 90 })
        .toFile(outputPath);
    } catch (sharpError) {
      console.error('Error processing with sharp:', sharpError);
      
      // Fallback: try to write the file directly
      fs.writeFileSync(outputPath, fileBuffer);
    }
    
    // Verify the file was created
    if (!fs.existsSync(outputPath)) {
      throw new Error('Failed to create the processed image file');
    }
    
    // Set permissions explicitly to ensure file is readable
    try {
      fs.chmodSync(outputPath, 0o644);
    } catch (permError) {
      console.error('Error setting file permissions:', permError);
    }
    
    // Return the relative path to be stored in DB
    return relativePath;
  } catch (error) {
    console.error('Error processing profile picture:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

module.exports = {
  processProfilePicture,
  uploadsDir,
  profileUploadsDir
}; 