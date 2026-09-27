const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/conversations/:conversationId/messages', protect, sendMessage);

module.exports = router;
