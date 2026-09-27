const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getJobSeekerApplications,
  getJobApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/apply/:jobId', protect, authorize('jobseeker'), applyForJob);
router.get('/my-applications', protect, authorize('jobseeker'), getJobSeekerApplications);
router.get('/applicants/:jobId?', protect, authorize('recruiter', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
