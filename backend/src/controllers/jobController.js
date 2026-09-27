const Job = require('../models/Job');
const RecruiterProfile = require('../models/RecruiterProfile');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const { calculateJobMatch } = require('../services/matching');
const { broadcastEvent } = require('../sockets/socket');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
const createJob = async (req, res) => {
  try {
    const { title, description, department, location, type, experienceLevel, salaryMin, salaryMax, requiredSkills, niceToHaveSkills } = req.body;

    const recruiterProfile = await RecruiterProfile.findOne({ user: req.user.id });
    const companyName = recruiterProfile ? recruiterProfile.companyName : req.user.name + "'s Company";
    const companyLogo = recruiterProfile ? recruiterProfile.companyLogo : '';

    let parsedRequired = requiredSkills;
    if (typeof requiredSkills === 'string') {
      parsedRequired = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    let parsedNice = niceToHaveSkills;
    if (typeof niceToHaveSkills === 'string') {
      parsedNice = niceToHaveSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const job = await Job.create({
      recruiter: req.user.id,
      companyProfile: recruiterProfile ? recruiterProfile._id : null,
      companyName,
      companyLogo,
      title,
      description,
      department: department || 'Engineering',
      location,
      type: type || 'full-time',
      experienceLevel: experienceLevel || 'Mid Level',
      salaryMin: salaryMin || 0,
      salaryMax: salaryMax || 0,
      requiredSkills: parsedRequired || [],
      niceToHaveSkills: parsedNice || [],
    });

    // Real-Time Socket Event Emission
    broadcastEvent('job_created', job);

    res.status(201).json({ success: true, message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all jobs with search & filters (and optional candidate match calculation)
// @route   GET /api/jobs
// @access  Public (or Private to show match percentage for candidate)
const getJobs = async (req, res) => {
  try {
    const { keyword, location, type, experienceLevel, skills, status } = req.query;

    let query = { status: status || 'open' };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { companyName: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (skills) {
      const skillsArr = skills.split(',').map((s) => s.trim());
      query.requiredSkills = { $in: skillsArr.map((s) => new RegExp(s, 'i')) };
    }

    const jobs = await Job.find(query).populate('recruiter', 'name email avatar').sort({ createdAt: -1 });

    // Calculate match percentage if logged-in user is a job seeker
    let userSkills = [];
    if (req.user && req.user.role === 'jobseeker') {
      const profile = await JobSeekerProfile.findOne({ user: req.user.id });
      if (profile) userSkills = profile.skills || [];
    }

    const formattedJobs = jobs.map((job) => {
      const jobObj = job.toObject();
      if (userSkills.length > 0) {
        const matchResult = calculateJobMatch(userSkills, job.requiredSkills, job.niceToHaveSkills);
        jobObj.matchPercentage = matchResult.matchPercentage;
        jobObj.matchingSkills = matchResult.matchingSkills;
        jobObj.missingSkills = matchResult.missingSkills;
      }
      return jobObj;
    });

    res.json({ success: true, count: formattedJobs.length, jobs: formattedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public / Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email avatar').populate('companyProfile');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const jobObj = job.toObject();

    if (req.user && req.user.role === 'jobseeker') {
      const profile = await JobSeekerProfile.findOne({ user: req.user.id });
      if (profile) {
        const matchResult = calculateJobMatch(profile.skills || [], job.requiredSkills, job.niceToHaveSkills);
        jobObj.matchPercentage = matchResult.matchPercentage;
        jobObj.matchingSkills = matchResult.matchingSkills;
        jobObj.missingSkills = matchResult.missingSkills;
      }
    }

    res.json({ success: true, job: jobObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter posted jobs
// @route   GET /api/jobs/recruiter/myjobs
// @access  Private (Recruiter)
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter/Admin)
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    if (typeof req.body.requiredSkills === 'string') {
      req.body.requiredSkills = req.body.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (typeof req.body.niceToHaveSkills === 'string') {
      req.body.niceToHaveSkills = req.body.niceToHaveSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Real-Time Socket Event Emission
    broadcastEvent('job_updated', job);

    res.json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    const jobId = job._id;
    await job.deleteOne();

    // Real-Time Socket Event Emission
    broadcastEvent('job_deleted', { jobId });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  deleteJob,
};
