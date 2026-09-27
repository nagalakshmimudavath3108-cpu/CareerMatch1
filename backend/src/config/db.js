const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ FATAL ERROR: MONGODB_URI environment variable is missing in Render environment settings!');
    } else {
      console.warn('⚠️ MONGODB_URI not found in environment, falling back to local MongoDB mongodb://127.0.0.1:27017/careermatch');
    }
  }

  const targetUri = mongoUri || 'mongodb://127.0.0.1:27017/careermatch';

  try {
    // Disable command buffering globally so queries execute immediately or fail fast instead of hanging 10s
    mongoose.set('bufferCommands', false);
    
    if (process.env.NODE_ENV === 'production') {
      // Disable auto-indexing in production to prevent index build locks from buffering queries on startup
      mongoose.set('autoIndex', false);
    }

    // Configure Mongoose options: 5s timeout on server selection
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

// Lifecycle connection listeners
mongoose.connection.on('connected', () => {
  console.log('💚 Mongoose connection established to MongoDB Atlas/Database');
});

mongoose.connection.on('error', (err) => {
  console.error(`🔴 Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose connection disconnected');
});

// Middleware to prevent buffering timeouts if database connection is unavailable
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Ensure MONGODB_URI is set in Render Environment Variables and MongoDB Atlas IP Network Access allows 0.0.0.0/0.',
      readyState: mongoose.connection.readyState,
    });
  }
  next();
};

module.exports = { connectDB, checkDbConnection };
