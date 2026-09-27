const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyWebsite: {
      type: String,
      default: '',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    companyBio: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: 'Technology',
    },
    companySize: {
      type: String,
      default: '1-50 employees',
    },
    location: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
