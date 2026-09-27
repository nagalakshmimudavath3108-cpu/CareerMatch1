const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

let io = null;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('_id name role email avatar');
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Join user room for targeted notifications
    socket.join(`user_${userId}`);

    // Update online status in DB
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit('user_online', { userId, isOnline: true });

    console.log(`🔌 Socket connected: User ${socket.user.name} (${userId})`);

    // Room join handlers
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${userId} joined room: conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        userName: socket.user.name,
        isTyping,
      });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user_offline', { userId, isOnline: false, lastSeen: new Date() });
      console.log(`🔌 Socket disconnected: User ${socket.user.name} (${userId})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

// Emit helper functions for Controllers
const notifyUser = (recipientId, event, data) => {
  if (io) {
    io.to(`user_${recipientId.toString()}`).emit(event, data);
  }
};

const notifyConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation_${conversationId.toString()}`).emit(event, data);
  }
};

const broadcastEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  notifyUser,
  notifyConversation,
  broadcastEvent,
  onlineUsers,
};
