const mongoose = require('mongoose');

// Configure global Mongoose settings IMMEDIATELY upon module load, BEFORE any models are compiled
mongoose.set('bufferCommands', false);
if (process.env.NODE_ENV === 'production') {
  mongoose.set('autoIndex', false);
}

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    console.log('⏳ Mongoose connection attempt already in progress...');
    return;
  }

  isConnecting = true;
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
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Schedule background retry after 5s if disconnected
    setTimeout(() => {
      if (mongoose.connection.readyState === 0) {
        console.log('🔄 Retrying MongoDB connection in background...');
        connectDB().catch((err) => console.error('Background reconnect failed:', err.message));
      }
    }, 5000);
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
    // Attempt background reconnect if disconnected
    if (mongoose.connection.readyState === 0) {
      connectDB().catch((err) => console.error('On-demand connection trigger failed:', err.message));
    }
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Ensure MONGODB_URI is set in Render Environment Variables and MongoDB Atlas IP Network Access allows 0.0.0.0/0.',
      readyState: mongoose.connection.readyState,
    });
  }
  next();
};

module.exports = { connectDB, checkDbConnection };

