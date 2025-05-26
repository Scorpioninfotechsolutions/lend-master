const express = require('express');
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile,
  getAllLenders,
  updateUser,
  deleteUser,
  updateUserProfile
} = require('../controllers/authController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

// Protected routes
router.get('/me', isAuthenticated, getUserProfile);
router.put('/profile/update', isAuthenticated, updateUserProfile);

// Admin routes
router.get('/lenders', isAuthenticated, authorizeRoles('admin'), getAllLenders);
router.put('/users/:id', isAuthenticated, authorizeRoles('admin'), updateUser);
router.delete('/users/:id', isAuthenticated, authorizeRoles('admin'), deleteUser);

module.exports = router; 