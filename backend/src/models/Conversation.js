const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
