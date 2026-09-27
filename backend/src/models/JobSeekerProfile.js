const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startYear: { type: String },
  endYear: { type: String },
  grade: { type: String },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  isCurrent: { type: Boolean, default: false },
  description: { type: String },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String }],
  githubLink: { type: String },
  liveLink: { type: String },
});

const jobSeekerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceYears: {
      type: Number,
      default: 0,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeOriginalName: {
      type: String,
      default: '',
    },
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
  },
  {
    timestamps: true,
  }
);

jobSeekerProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
