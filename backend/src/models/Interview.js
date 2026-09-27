const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
    },
    description: {
      type: String,
      default: '',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Online Video Call',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ candidate: 1 });
interviewSchema.index({ recruiter: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
