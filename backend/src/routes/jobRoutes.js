const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Optional auth middleware for getJobs so candidates get match calculations
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

router.get('/', optionalAuth, getJobs);
router.get('/recruiter/myjobs', protect, authorize('recruiter', 'admin'), getRecruiterJobs);
router.get('/:id', optionalAuth, getJobById);

router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
