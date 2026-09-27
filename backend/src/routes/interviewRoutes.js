const express = require('express');
const router = express.Router();
const {
  scheduleInterview,
  getInterviews,
  updateInterview,
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('recruiter', 'admin'), scheduleInterview);
router.get('/', protect, getInterviews);
router.put('/:id', protect, updateInterview);

module.exports = router;
