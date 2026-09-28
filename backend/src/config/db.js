const mongoose = require('mongoose');

// Configure global Mongoose settings IMMEDIATELY upon module load, BEFORE any models are compiled
mongoose.set('bufferCommands', false);
if (process.env.NODE_ENV === 'production') {
  mongoose.set('autoIndex', false);
}

let isConnecting = false;
let lastDbError = null;

const getLastDbError = () => lastDbError;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    console.log('⏳ Mongoose connection attempt already in progress...');
    return;
  }

  isConnecting = true;
  const mongoUri = (process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');

  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ FATAL ERROR: MONGODB_URI environment variable is missing in Render environment settings!');
      lastDbError = 'MONGODB_URI environment variable is missing in Render environment settings';
    } else {
      console.warn('⚠️ MONGODB_URI not found in environment, falling back to local MongoDB mongodb://127.0.0.1:27017/careermatch');
    }
  }

  const targetUri = mongoUri || 'mongodb://127.0.0.1:27017/careermatch';
  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4,
    retryWrites: true,
  };


  const tryConnect = async (uriToTry) => {
    return await mongoose.connect(uriToTry, connectionOptions);
  };

  try {
    const conn = await tryConnect(targetUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    isConnecting = false;
    lastDbError = null;
    return conn;
  } catch (error) {
    if (error.message.includes('Authentication failed') && targetUri.startsWith('mongodb+srv://')) {
      const sep = targetUri.includes('?') ? '&' : '?';
      const fallbacks = [
        !targetUri.includes('authSource=') ? `${targetUri}${sep}authSource=admin` : null,
        !targetUri.includes('authMechanism=') ? `${targetUri}${sep}authSource=admin&authMechanism=SCRAM-SHA-256` : null,
        !targetUri.includes('authMechanism=') ? `${targetUri}${sep}authSource=admin&authMechanism=SCRAM-SHA-1` : null,
      ].filter(Boolean);

      for (const fallbackUri of fallbacks) {
        try {
          console.log(`🔄 Retrying connection with fallback parameters...`);
          const conn = await tryConnect(fallbackUri);
          console.log(`✅ MongoDB Connected via fallback: ${conn.connection.host} (Database: ${conn.connection.name})`);
          isConnecting = false;
          lastDbError = null;
          return conn;
        } catch (fbErr) {
          error = fbErr;
        }
      }
    }

    isConnecting = false;
    lastDbError = error.message;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
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
  lastDbError = null;
  try {
    const { autoSeedIfEmpty } = require('../seed');
    autoSeedIfEmpty().catch((err) => console.error('Auto-seed check failed on connect:', err.message));
  } catch (e) {
    // Ignore require circularity edge cases
  }
});

mongoose.connection.on('error', (err) => {
  console.error(`🔴 Mongoose connection error: ${err.message}`);
  lastDbError = err.message;
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose connection disconnected');
});

// Helper to wait for database connection during cold-start or pending connection states
const waitForDbConnection = async (timeoutMs = 12000) => {
  const startTime = Date.now();
  while (mongoose.connection.readyState !== 1) {
    if (mongoose.connection.readyState === 0) {
      connectDB().catch((err) => console.error('On-demand connection trigger failed:', err.message));
    }
    if (Date.now() - startTime >= timeoutMs) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return true;
};

// Middleware to prevent buffering timeouts if database connection is unavailable
const checkDbConnection = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    const isConnected = await waitForDbConnection(12000);
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Ensure MONGODB_URI is set in Render Environment Variables and MongoDB Atlas IP Network Access allows 0.0.0.0/0.',
        readyState: mongoose.connection.readyState,
        lastError: lastDbError || 'Connection attempt timed out after 12000ms',
      });
    }
  }
  next();
};

module.exports = { connectDB, checkDbConnection, waitForDbConnection, getLastDbError };
