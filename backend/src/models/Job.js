const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecruiterProfile',
    },
    companyName: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Executive'],
      default: 'Mid Level',
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    salaryCurrency: {
      type: String,
      default: 'USD',
    },
    requiredSkills: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    niceToHaveSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

jobSchema.index({ title: 'text', description: 'text', companyName: 'text', requiredSkills: 'text' });
jobSchema.index({ recruiter: 1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema);
