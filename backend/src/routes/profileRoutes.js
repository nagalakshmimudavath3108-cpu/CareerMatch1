const express = require('express');
const router = express.Router();
const {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/jobseeker/:id?', protect, getJobSeekerProfile);
router.put(
  '/jobseeker',
  protect,
  authorize('jobseeker', 'admin'),
  upload.single('resume'),
  updateJobSeekerProfile
);

router.get('/recruiter/:id?', protect, getRecruiterProfile);
router.put(
  '/recruiter',
  protect,
  authorize('recruiter', 'admin'),
  upload.single('logo'),
  updateRecruiterProfile
);

module.exports = router;
