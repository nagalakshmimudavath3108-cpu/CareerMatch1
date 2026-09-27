const mongoose = require('mongoose');

const statusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'hired'],
    required: true,
  },
  note: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'hired'],
      default: 'applied',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchingSkills: [
      {
        type: String,
      },
    ],
    missingSkills: [
      {
        type: String,
      },
    ],
    timeline: [statusTimelineSchema],
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });
applicationSchema.index({ jobSeeker: 1 });
applicationSchema.index({ recruiter: 1 });

module.exports = mongoose.model('Application', applicationSchema);
