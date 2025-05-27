const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');

// Helper function to send token response
const sendToken = (user, statusCode, res) => {
  // Create JWT token
  const token = user.getJwtToken();

  // Options for cookie
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user
    });
};

// Register a user => /api/v1/auth/register
exports.registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role, phone, dob, address, status } = req.body;
    const isAdminRegister = req.query.admin_register === 'true';

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password,
      role: role || 'lender', // Default to lender if no role provided
      phone,
      dob,
      address,
      status
    });

    // If it's an admin registering a user, don't set cookie
    if (isAdminRegister) {
      // Remove password from output
      user.password = undefined;
      
      return res.status(201).json({
        success: true,
        user
      });
    }

    // Normal registration flow with cookie and token
    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user => /api/v1/auth/login
exports.loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const requestedRole = req.query.requested_role;

    console.log(`Login attempt: ${username}, requested role: ${requestedRole || 'none'}, password provided: ${!!password}`);
    console.log(`Password value: "${password}"`); // Log actual password for debugging

    // Check if username and password are entered
    if (!username || !password) {
      console.log('Missing username or password');
      return next(new ErrorHandler('Please enter username & password', 400));
    }

    // First, try to find the user with the exact username
    let user = await User.findOne({ username }).select('+password');

    if (!user) {
      console.log(`Login failed: User not found with exact username: ${username}`);
      
      // Try to find the user by case-insensitive username
      user = await User.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') } 
      }).select('+password');
      
      if (!user) {
        console.log(`Login failed: User not found with case-insensitive search either`);
        
        // Special handling for borrower logins
        if (requestedRole === 'borrower') {
          console.log('Checking if this user might be in the system with a different role...');
          
          // Look for any user with similar username regardless of role
          const possibleUsers = await User.find({
            username: { $regex: new RegExp(`${username}`, 'i') }
          }).select('_id username role');
          
          if (possibleUsers.length > 0) {
            console.log('Found similar users:', possibleUsers.map(u => `${u.username} (${u.role})`));
          } else {
            console.log('No similar users found in the system');
          }
        }
        
        return next(new ErrorHandler('Invalid Username or Password', 401));
      }
      
      console.log(`Found user using case-insensitive match: ${user.username}`);
    }

    console.log(`User found: ${user.username}, user role: ${user.role}, requesting: ${requestedRole}`);
    
    // Debug: print password info (hashed, not actual passwords)
    console.log(`Password from DB exists: ${!!user.password}, length: ${user.password ? user.password.length : 'undefined'}`);
    console.log(`Password from DB value: ${user.password}`); // Log actual hashed password for debugging
    console.log(`Password provided (length): ${password ? password.length : 'undefined'}`);

    // Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);
    console.log(`Password match result: ${isPasswordMatched}`);

    if (!isPasswordMatched) {
      console.log(`Login failed: Incorrect password for username: ${username}`);
      
      // Special case for borrowers - try to fix the account
      if (requestedRole === 'borrower') {
        console.log('This is a borrower login attempt, checking if we can recover the account...');
        
        // Check if this might be a borrower created by a lender with issues
        const relatedActivity = await require('../models/ActivityLog').findOne({
          relatedUser: user._id,
          type: 'system',
          'metadata.action_type': 'borrower_created'
        });
        
        if (relatedActivity) {
          console.log(`Found related activity log: borrower was created by lender ${relatedActivity.user}`);
          
          // For testing: temporarily update password (REMOVE IN PRODUCTION)
          if (process.env.NODE_ENV !== 'production') {
            console.log('DEV MODE: Fixing borrower password...');
            user.password = password;
            user.role = 'borrower';
            await user.save();
            
            // Try to match again
            const updatedUser = await User.findById(user._id).select('+password');
            const isFixedMatch = await updatedUser.comparePassword(password);
            
            if (isFixedMatch) {
              console.log('Password fixed successfully - proceeding with login');
              // Continue with the fixed user
              user = updatedUser;
            } else {
              console.log('Failed to fix password - returning error');
              return next(new ErrorHandler('Invalid Username or Password', 401));
            }
          } else {
            return next(new ErrorHandler('Invalid Username or Password', 401));
          }
        } else {
          return next(new ErrorHandler('Invalid Username or Password', 401));
        }
      } else {
        return next(new ErrorHandler('Invalid Username or Password', 401));
      }
    }

    // Check if user is active
    if (user.status === 'Inactive') {
      console.log(`Login failed: User ${username} is inactive`);
      return next(new ErrorHandler('Your account is inactive. Please contact the administrator.', 403));
    }

    // Validate role if it was requested
    if (requestedRole && user.role !== requestedRole) {
      console.log(`Role mismatch: User ${username} has role "${user.role}", but "${requestedRole}" was requested`);
      
      // Special case for borrowers:
      // If a user is trying to login as a borrower, allow it and update their role
      if (requestedRole === 'borrower') {
        console.log(`Fixing role: Updating user ${username} from role "${user.role}" to "borrower"`);
        user.role = 'borrower';
        await user.save();
        console.log(`Role updated successfully to borrower`);
      } else {
        return next(new ErrorHandler(`Access denied. You do not have ${requestedRole} permissions.`, 403));
      }
    }

    // If no role set at all, assign the requested role
    if (!user.role && requestedRole) {
      console.log(`User ${username} has no role set, assigning requested role: ${requestedRole}`);
      user.role = requestedRole;
      await user.save();
    }

    // Clear any existing cookies completely to prevent session conflicts
    res.clearCookie('token');
    res.clearCookie('token', { path: '/' });
    
    console.log(`Login successful for ${username} with role ${user.role}`);
    
    // Set a new token with appropriate session info
    sendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Logout user => /api/v1/auth/logout
exports.logoutUser = async (req, res, next) => {
  try {
    // Multiple approaches to clear the cookie to ensure it's fully removed
    
    // Approach 1: Use clearCookie
    res.clearCookie('token');
    res.clearCookie('token', { path: '/' });
    
    // Approach 2: Set to null with immediate expiration
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Approach 3: Set to empty string with expiration in the past
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get currently logged in user details => /api/v1/auth/me
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    
    // If role verification is requested, include role information but don't error
    if (req.query.verify_admin === 'true') {
      return res.status(200).json({
        success: true,
        user,
        isAdmin: user.role === 'admin',
        role: user.role
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Get all lenders => /api/v1/auth/lenders
exports.getAllLenders = async (req, res, next) => {
  try {
    const lenders = await User.find({ role: 'lender' }).select('-__v');

    res.status(200).json({
      success: true,
      lenders
    });
  } catch (error) {
    next(error);
  }
};

// Update user => /api/v1/auth/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, username, email, password, phone, dob, address, status } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (dob) updateData.dob = dob;
    if (address) updateData.address = address;
    if (status) updateData.status = status;
    
    // Find the user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    
    // If password is being updated, we need to handle it separately
    // because it needs to be hashed
    if (password) {
      user.password = password;
      await user.save(); // This will trigger the pre-save hook to hash the password
      
      // Update other fields
      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(req.params.id, updateData, {
          new: true,
          runValidators: true
        });
      }
    } else {
      // Just update fields without password
      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(req.params.id, updateData, {
          new: true,
          runValidators: true
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify password for sensitive operations => /api/v1/auth/verify-password
exports.verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    console.log(`Verifying password for user: ${req.user.id}`);

    // Check if password is entered
    if (!password) {
      console.log('Password not provided in request');
      return res.status(400).json({
        success: false,
        message: 'Please enter your password'
      });
    }

    // Find user in database
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      console.log(`User not found with ID: ${req.user.id}`);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);
    console.log(`Password verification result: ${isPasswordMatched ? 'Success' : 'Failure'}`);

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Password is correct
    res.status(200).json({
      success: true,
      message: 'Password verified successfully'
    });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying password',
      error: error.message
    });
  }
};

// Delete user => /api/v1/auth/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update user's own profile => /api/v1/auth/profile/update
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, dob, address } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (dob) updateData.dob = dob;
    if (address) updateData.address = address;
    
    // Process profile picture if provided
    if (req.files && req.files.profilePicture) {
      try {
        console.log('Profile picture received for processing');
        const { processProfilePicture } = require('../utils/fileUpload');
        const profilePicturePath = await processProfilePicture(req.files.profilePicture);
        
        if (profilePicturePath) {
          console.log('Profile picture processed successfully, path:', profilePicturePath);
          updateData.profilePicture = profilePicturePath;
        }
      } catch (fileError) {
        console.error('Error processing profile picture:', fileError);
        return next(new ErrorHandler('Failed to process profile picture: ' + fileError.message, 400));
      }
    }
    
    console.log('Updating user profile with data:', updateData);
    
    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    
    console.log('User profile updated successfully');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    next(error);
  }
}; 