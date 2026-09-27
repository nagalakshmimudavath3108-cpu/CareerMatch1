const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// CORS configuration supporting credentials with dynamic origin echoing
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerMatch Platform API is running smoothly', time: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/admin', adminRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
