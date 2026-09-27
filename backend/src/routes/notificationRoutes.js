const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markNotificationRead);
router.put('/read-all', protect, markAllNotificationsRead);

module.exports = router;
