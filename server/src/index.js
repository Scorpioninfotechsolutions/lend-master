const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
const connectDatabase = require('./config/db');
const errorMiddleware = require('./middleware/error');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Connect to database
connectDatabase();

// Create Express app
const app = express();

// Import file upload utility to ensure paths are consistent
const { uploadsDir, profileUploadsDir } = require('./utils/fileUpload');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
  console.log('Created uploads directory:', uploadsDir);
}

if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true, mode: 0o755 });
  console.log('Created profile uploads directory:', profileUploadsDir);
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));

// File upload middleware
app.use(fileUpload({
  useTempFiles: false,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
}));

// Direct file serving for profile images
app.get('/uploads/profiles/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(profileUploadsDir, filename);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } else {
    res.status(404).send('Image not found');
  }
});

// Serve static files from uploads directory - keep this as a fallback
app.use('/uploads', express.static(uploadsDir, {
  fallthrough: true, // Continue to next middleware if file not found
  index: false, // Disable directory listing
  extensions: ['webp', 'jpg', 'jpeg', 'png'], // Supported extensions
  setHeaders: (res, path) => {
    // Set appropriate headers for images
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // Add caching headers
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
}));

// Import routes
const authRoutes = require('./routes/auth');
const activityLogRoutes = require('./routes/activityLogs');
const borrowersRoutes = require('./routes/borrowers');
const adminRoutes = require('./routes/admin');

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/logs', activityLogRoutes);
app.use('/api/v1/borrowers', borrowersRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down server due to unhandled promise rejection');
  
  server.close(() => {
    process.exit(1);
  });
}); 