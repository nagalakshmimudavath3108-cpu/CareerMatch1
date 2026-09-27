const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

    res.json({ success: true, message: 'Notification marked as read', unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });

    res.json({ success: true, message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
