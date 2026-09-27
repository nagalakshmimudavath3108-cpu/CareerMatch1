const JobSeekerProfile = require('../models/JobSeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const User = require('../models/User');
const { broadcastEvent } = require('../sockets/socket');

// @desc    Get Job Seeker Profile
// @route   GET /api/profiles/jobseeker/:id?
// @access  Private
const getJobSeekerProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    let profile = await JobSeekerProfile.findOne({ user: userId }).populate('user', 'name email avatar isOnline lastSeen');
    
    if (!profile && userId === req.user.id) {
      profile = await JobSeekerProfile.create({ user: userId });
      profile = await profile.populate('user', 'name email avatar isOnline lastSeen');
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Job Seeker Profile
// @route   PUT /api/profiles/jobseeker
// @access  Private (JobSeeker)
const updateJobSeekerProfile = async (req, res) => {
  try {
    const { headline, bio, location, phone, website, github, linkedin, skills, experienceYears, education, experience, projects, name } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name });
    }

    let parsedSkills = skills;
    if (typeof skills === 'string') {
      parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    let profile = await JobSeekerProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new JobSeekerProfile({ user: req.user.id });
    }

    profile.headline = headline !== undefined ? headline : profile.headline;
    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.location = location !== undefined ? location : profile.location;
    profile.phone = phone !== undefined ? phone : profile.phone;
    profile.website = website !== undefined ? website : profile.website;
    profile.github = github !== undefined ? github : profile.github;
    profile.linkedin = linkedin !== undefined ? linkedin : profile.linkedin;
    profile.skills = parsedSkills || profile.skills;
    profile.experienceYears = experienceYears !== undefined ? Number(experienceYears) : profile.experienceYears;
    profile.education = education ? (typeof education === 'string' ? JSON.parse(education) : education) : profile.education;
    profile.experience = experience ? (typeof experience === 'string' ? JSON.parse(experience) : experience) : profile.experience;
    profile.projects = projects ? (typeof projects === 'string' ? JSON.parse(projects) : projects) : profile.projects;

    if (req.file) {
      profile.resumeUrl = `/uploads/${req.file.filename}`;
      profile.resumeOriginalName = req.file.originalname;
    }

    await profile.save();
    const updatedProfile = await JobSeekerProfile.findOne({ user: req.user.id }).populate('user', 'name email avatar');

    // Broadcast real-time profile update so match scores refresh live across active screens
    broadcastEvent('profile_updated', { userId: req.user.id, skills: profile.skills });

    res.json({ success: true, message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Recruiter Profile
// @route   GET /api/profiles/recruiter/:id?
// @access  Private
const getRecruiterProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    let profile = await RecruiterProfile.findOne({ user: userId }).populate('user', 'name email avatar isOnline lastSeen');

    if (!profile && userId === req.user.id) {
      profile = await RecruiterProfile.create({ user: userId, companyName: req.user.name + "'s Company" });
      profile = await profile.populate('user', 'name email avatar isOnline lastSeen');
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Recruiter Profile
// @route   PUT /api/profiles/recruiter
// @access  Private (Recruiter)
const updateRecruiterProfile = async (req, res) => {
  try {
    const { companyName, companyWebsite, companyBio, industry, companySize, location, phone, name } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name });
    }

    let profile = await RecruiterProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new RecruiterProfile({ user: req.user.id, companyName: companyName || 'Company' });
    }

    profile.companyName = companyName !== undefined ? companyName : profile.companyName;
    profile.companyWebsite = companyWebsite !== undefined ? companyWebsite : profile.companyWebsite;
    profile.companyBio = companyBio !== undefined ? companyBio : profile.companyBio;
    profile.industry = industry !== undefined ? industry : profile.industry;
    profile.companySize = companySize !== undefined ? companySize : profile.companySize;
    profile.location = location !== undefined ? location : profile.location;
    profile.phone = phone !== undefined ? phone : profile.phone;

    if (req.file) {
      profile.companyLogo = `/uploads/${req.file.filename}`;
    }

    await profile.save();
    const updatedProfile = await RecruiterProfile.findOne({ user: req.user.id }).populate('user', 'name email avatar');

    res.json({ success: true, message: 'Company profile updated successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
};
