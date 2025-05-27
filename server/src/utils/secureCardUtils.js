const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Encryption key and initialization vector
// In production, these should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-key-min-32-chars-length123'; // Must be 32 bytes for aes-256-cbc
const IV_LENGTH = 16; // For AES, this is always 16

// Create a buffer of the exact length required (32 bytes for AES-256)
const getEncryptionKey = () => {
  // If env variable exists, use it
  const key = process.env.ENCRYPTION_KEY || 'your-secure-key-min-32-chars-length123';
  
  // Log key status without revealing the actual key
  if (process.env.ENCRYPTION_KEY) {
    console.log('Using ENCRYPTION_KEY from environment variables');
  } else {
    console.warn('WARNING: Using fallback encryption key! This is not secure for production use.');
  }
  
  // Create a buffer of the exact size needed (32 bytes)
  // If the key is too short, it will be padded with zeros
  // If it's too long, it will be truncated
  return Buffer.alloc(32, key.padEnd(32, '0').slice(0, 32));
};

/**
 * Hash sensitive card information
 * 
 * @param {string} value - The sensitive value to hash
 * @returns {Promise<string>} - Hashed value
 */
const hashCardDetail = async (value) => {
  if (!value) {
    console.log('hashCardDetail: No value provided');
    return null;
  }
  
  // Convert to string to ensure bcrypt compatibility
  const stringValue = String(value);
  console.log(`hashCardDetail: Hashing value (length: ${stringValue.length})`);
  
  try {
    // Use a strong salt (12 rounds) for better security
    const hashedValue = await bcrypt.hash(stringValue, 12);
    console.log(`hashCardDetail: Successfully hashed value, result starts with: ${hashedValue.substring(0, 10)}...`);
    return hashedValue;
  } catch (error) {
    console.error('hashCardDetail: Error hashing value:', error);
    throw error;
  }
};

/**
 * Compare entered card detail with hashed value
 * 
 * @param {string} enteredValue - The value entered by user
 * @param {string} hashedValue - The hashed value from database
 * @returns {Promise<boolean>} - True if values match, false otherwise
 */
const compareCardDetail = async (enteredValue, hashedValue) => {
  if (!enteredValue || !hashedValue) return false;
  
  return await bcrypt.compare(String(enteredValue), hashedValue);
};

/**
 * Determine if a card detail needs to be hashed (not already hashed)
 * This is useful when updating values to avoid double-hashing
 * 
 * @param {string} value - The value to check
 * @returns {boolean} - True if the value needs to be hashed, false if already hashed
 */
const needsHashing = (value) => {
  if (!value) return false;
  
  // bcrypt hashes start with $2a$, $2b$ or $2y$
  return !String(value).startsWith('$2');
};

/**
 * Encrypt a value using AES-256-CBC
 * 
 * @param {string} text - The text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedText (hex encoded)
 */
const encryptValue = (text) => {
  if (!text) return null;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return iv:encryptedData format
    const result = iv.toString('hex') + ':' + encrypted.toString('hex');
    console.log('Successfully encrypted value');
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt a value that was encrypted with encryptValue
 * 
 * @param {string} text - The encrypted text in format: iv:encryptedText (hex encoded)
 * @returns {string} - Decrypted text
 */
const decryptValue = (text) => {
  if (!text) return null;
  
  // Split text into iv and encrypted parts
  const textParts = text.split(':');
  
  // Check format is correct
  if (textParts.length !== 2) {
    console.error('Invalid encrypted format. Expected format: iv:encryptedText');
    return null;
  }
  
  try {
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    console.log('Successfully decrypted value');
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Store sensitive data securely
 * 
 * @param {Object} data - Object containing sensitive data
 * @returns {Object} - Object with encrypted values
 */
const encryptCardDetails = (data) => {
  const encrypted = {};
  
  if (data.cvv) {
    encrypted.cvv = encryptValue(data.cvv);
  }
  
  if (data.atmPin) {
    encrypted.atmPin = encryptValue(data.atmPin);
  }
  
  return encrypted;
};

/**
 * Get decrypted sensitive data
 * 
 * @param {Object} data - Object containing encrypted values
 * @returns {Object} - Object with decrypted values
 */
const decryptCardDetails = (data) => {
  const decrypted = { ...data };
  
  if (data.encryptedCvv) {
    decrypted.cvv = decryptValue(data.encryptedCvv);
    delete decrypted.encryptedCvv;
  }
  
  if (data.encryptedAtmPin) {
    decrypted.atmPin = decryptValue(data.encryptedAtmPin);
    delete decrypted.encryptedAtmPin;
  }
  
  return decrypted;
};

module.exports = {
  hashCardDetail,
  compareCardDetail,
  needsHashing,
  encryptValue,
  decryptValue,
  encryptCardDetails,
  decryptCardDetails
}; 