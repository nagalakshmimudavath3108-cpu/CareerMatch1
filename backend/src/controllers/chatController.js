const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { notifyUser, notifyConversation } = require('../sockets/socket');

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'name email avatar isOnline lastSeen role')
      .populate('job', 'title companyName')
      .populate('application', 'status matchPercentage')
      .sort({ lastMessageAt: -1 });

    // Calculate unread count per conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();
        const unreadMessagesCount = await Message.countDocuments({
          conversation: conv._id,
          recipient: req.user.id,
          read: false,
        });
        convObj.unreadCount = unreadMessagesCount;
        return convObj;
      })
    );

    res.json({ success: true, count: conversationsWithUnread.length, conversations: conversationsWithUnread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:conversationId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Mark messages sent to this user as read
    await Message.updateMany(
      { conversation: conversationId, recipient: req.user.id, read: false },
      { read: true }
    );

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/chat/conversations/:conversationId/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, attachmentUrl } = req.body;

    if (!text && !attachmentUrl) {
      return res.status(400).json({ success: false, message: 'Message text or attachment is required' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }

    const recipientId = conversation.participants.find(
      (pId) => pId.toString() !== req.user.id
    );

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      recipient: recipientId,
      text: text || 'Sent an attachment',
      attachmentUrl: attachmentUrl || '',
    });

    conversation.lastMessage = text || 'Sent an attachment';
    conversation.lastMessageSender = req.user.id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar role');

    // Real-Time Socket Emission
    notifyConversation(conversationId, 'new_message', populatedMessage);
    
    // Also notify recipient user directly if not currently in room
    notifyUser(recipientId, 'chat_notification', {
      message: populatedMessage,
      conversationId,
      senderName: req.user.name,
    });

    // Create Notification if needed
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: 'new_message',
      title: `New message from ${req.user.name}`,
      message: text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : 'Sent an attachment',
      link: `/messages?conversationId=${conversationId}`,
    });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
