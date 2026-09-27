const http = require('http');
require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./sockets/socket');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Bind explicitly to 0.0.0.0 so both IPv4 (127.0.0.1) and IPv6 connections are accepted
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CareerMatch Server listening on port ${PORT} (0.0.0.0) in ${process.env.NODE_ENV || 'development'} mode`);
});
