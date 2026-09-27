const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const RecruiterProfile = require('../models/RecruiterProfile');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: 'jobseeker' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });
    const totalApplications = await Application.countDocuments();
    const totalHired = await Application.countDocuments({ status: 'hired' });

    // Applications status breakdown
    const statusBreakdown = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Match Percentage Distribution
    const matchDistribution = await Application.aggregate([
      {
        $bucket: {
          groupBy: '$matchPercentage',
          boundaries: [0, 25, 50, 75, 101],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    // Top required skills across open jobs
    const topSkillsAggregate = await Job.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: { $toLower: '$requiredSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalJobSeekers,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        totalHired,
        statusBreakdown,
        matchDistribution,
        topSkills: topSkillsAggregate.map((s) => ({ skill: s._id, count: s.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, keyword } = req.query;
    let query = {};

    if (role) query.role = role;
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all jobs for admin management
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all applications for admin management
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title companyName')
      .populate('jobSeeker', 'name email')
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllJobsAdmin,
  getAllApplicationsAdmin,
};
