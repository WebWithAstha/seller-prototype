const express = require('express');
// const mongoose = require('mongoose');

const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();


// Import routes
const apiRoutes = require('./routes/index.js');

// Initialize Express app
const app = express();

// ======================
// MIDDLEWARE SETUP
// ======================

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const devOrigins = process.env.DEV_CORS_ORIGINS
  ? process.env.DEV_CORS_ORIGINS.split(',')
  : [];

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || 'http://localhost:3000'
      : devOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});



// ======================
// DATABASE CONNECTION
// ======================
// const { connectDB } = require('./config/db.js');




const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));


// ======================
// API ROUTES
// ======================

// Mount API routes
app.use('/api', apiRoutes);




// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'POST /api/upload-images- Upload images'
    ]
  });
});

// ======================
// GRACEFUL SHUTDOWN
// ======================

const gracefulShutdown = (signal) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      console.log('👋 Graceful shutdown completed');
      process.exit(0);
    });
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));



// ======================
// SERVER STARTUP
// ======================

const startServer = async () => {
  try {
    // Create necessary directories
    
    // Connect to database
    // await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`📡 Server running on port ${PORT}`);
      console.log('\n✨ Server ready to accept requests!\n');
    });
    
    // Set server timeout
    server.timeout = 300000; // 5 minutes
    
    // Make server available for graceful shutdown
    global.server = server;
    
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;