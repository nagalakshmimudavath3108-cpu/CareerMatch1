const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, companyWebsite, headline, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'jobseeker',
    });

    if (user.role === 'jobseeker') {
      let parsedSkills = [];
      if (Array.isArray(skills)) {
        parsedSkills = skills;
      } else if (typeof skills === 'string' && skills.trim()) {
        parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }

      await JobSeekerProfile.create({
        user: user._id,
        headline: headline || 'Job Seeker / Student',
        skills: parsedSkills,
      });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.create({
        user: user._id,
        companyName: companyName || `${user.name}'s Company`,
        companyWebsite: companyWebsite || '',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'jobseeker') {
      profile = await JobSeekerProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updatePassword,
};
