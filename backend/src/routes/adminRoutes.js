const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllJobsAdmin,
  getAllApplicationsAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobsAdmin);
router.get('/applications', getAllApplicationsAdmin);

module.exports = router;
