const http = require('http');
require('dotenv').config();
const { connectDB } = require('./config/db');
const app = require('./app');
const { initSocket } = require('./sockets/socket');
const { autoSeedIfEmpty } = require('./seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Await MongoDB connection before starting HTTP server listener
    await connectDB();
    await autoSeedIfEmpty();
  } catch (err) {
    console.error('⚠️ MongoDB connection could not be established on boot:', err.message);
    console.error('👉 Make sure MONGODB_URI is set in Render Dashboard and MongoDB Atlas Network Access permits 0.0.0.0/0');
  }

  const server = http.createServer(app);

  // Initialize Socket.IO
  initSocket(server);

  // Bind explicitly to 0.0.0.0 so both IPv4 and IPv6 connections are accepted
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CareerMatch Server listening on port ${PORT} (0.0.0.0) in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
