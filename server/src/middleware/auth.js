const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/User');

// Check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(new ErrorHandler('Login first to access this resource', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorHandler('User not found or session invalid', 401));
    }
    
    // Check if user account is active
    if (user.status === 'Inactive') {
      return next(new ErrorHandler('Your account is inactive. Please contact the administrator', 403));
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    return next(new ErrorHandler('Authentication failed', 401));
  }
};

// Authorize roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403));
    }
    next();
  };
}; 