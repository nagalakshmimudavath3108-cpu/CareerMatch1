const Application = require('../models/Application');
const Job = require('../models/Job');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const { calculateJobMatch } = require('../services/matching');
const { notifyUser } = require('../sockets/socket');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (JobSeeker)
const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This job posting is no longer accepting applications' });
    }

    const existingApplication = await Application.findOne({ job: jobId, jobSeeker: req.user.id });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this position' });
    }

    const profile = await JobSeekerProfile.findOne({ user: req.user.id });
    const candidateSkills = profile ? profile.skills || [] : [];

    const match = calculateJobMatch(candidateSkills, job.requiredSkills, job.niceToHaveSkills);

    const resumeUrl = (profile && profile.resumeUrl) || (req.body.resumeUrl || '');

    const application = await Application.create({
      job: jobId,
      jobSeeker: req.user.id,
      recruiter: job.recruiter,
      status: 'applied',
      coverLetter: req.body.coverLetter || '',
      resumeUrl,
      matchPercentage: match.matchPercentage,
      matchingSkills: match.matchingSkills,
      missingSkills: match.missingSkills,
      timeline: [{ status: 'applied', note: 'Application submitted', updatedAt: new Date() }],
    });

    // Increment applicants count
    job.applicantsCount += 1;
    await job.save();

    // Create or retrieve conversation between job seeker and recruiter
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, job.recruiter] },
      job: jobId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, job.recruiter],
        application: application._id,
        job: jobId,
        lastMessage: `Application submitted for position: ${job.title}`,
        lastMessageSender: req.user.id,
        lastMessageAt: new Date(),
      });
    }

    // Create Notification for Recruiter
    const notification = await Notification.create({
      recipient: job.recruiter,
      sender: req.user.id,
      type: 'application_received',
      title: 'New Applicant Received!',
      message: `${req.user.name} applied for "${job.title}" with a ${match.matchPercentage}% match score.`,
      link: `/recruiter/applicants?jobId=${jobId}`,
    });

    // Emit Real-Time Socket Event to Recruiter
    notifyUser(job.recruiter, 'new_applicant', {
      applicationId: application._id,
      jobTitle: job.title,
      candidateName: req.user.name,
      matchPercentage: match.matchPercentage,
      notification,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
      conversationId: conversation._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get candidate's applied jobs
// @route   GET /api/applications/my-applications
// @access  Private (JobSeeker)
const getJobSeekerApplications = async (req, res) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user.id })
      .populate({
        path: 'job',
        select: 'title companyName companyLogo location type salaryMin salaryMax status department requiredSkills',
      })
      .populate('recruiter', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recruiter's job applicants (filtered by jobId optional)
// @route   GET /api/applications/job/:jobId?
// @access  Private (Recruiter/Admin)
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    let query = {};

    if (req.user.role === 'recruiter') {
      query.recruiter = req.user.id;
    }

    if (jobId) {
      query.job = jobId;
    }

    const { status, minMatch } = req.query;
    if (status) {
      query.status = status;
    }
    if (minMatch) {
      query.matchPercentage = { $gte: Number(minMatch) };
    }

    const applications = await Application.find(query)
      .populate('job', 'title companyName requiredSkills location type')
      .populate('jobSeeker', 'name email avatar isOnline lastSeen')
      .sort({ matchPercentage: -1, createdAt: -1 });

    // Attach candidate profile data
    const populatedApps = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        const seekerProfile = await JobSeekerProfile.findOne({ user: app.jobSeeker._id });
        appObj.candidateProfile = seekerProfile;
        return appObj;
      })
    );

    res.json({ success: true, count: populatedApps.length, applications: populatedApps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Application Status (Shortlist, Reject, Hire)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter/Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('job', 'title companyName')
      .populate('jobSeeker', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    application.status = status;
    application.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedAt: new Date(),
    });

    await application.save();

    // Create Notification for Candidate
    const statusTitles = {
      shortlisted: '🌟 Application Shortlisted!',
      interview_scheduled: '📅 Interview Scheduled!',
      rejected: 'Application Status Update',
      hired: '🎉 Congratulations! You are Hired!',
    };

    const statusMessages = {
      shortlisted: `Good news! Your application for "${application.job.title}" at ${application.job.companyName} has been shortlisted.`,
      interview_scheduled: `An interview has been scheduled for your application to "${application.job.title}".`,
      rejected: `Thank you for applying. The recruiter has decided not to proceed with your application for "${application.job.title}".`,
      hired: `You have been selected for the position of "${application.job.title}" at ${application.job.companyName}!`,
    };

    const notification = await Notification.create({
      recipient: application.jobSeeker._id,
      sender: req.user.id,
      type: 'status_changed',
      title: statusTitles[status] || 'Application Status Updated',
      message: statusMessages[status] || `Your application status for "${application.job.title}" changed to ${status}.`,
      link: '/jobseeker/applications',
    });

    // Emit Real-Time Socket Notification to Candidate
    notifyUser(application.jobSeeker._id, 'application_status_updated', {
      applicationId: application._id,
      jobTitle: application.job.title,
      newStatus: status,
      notification,
    });

    res.json({ success: true, message: `Application status updated to ${status}`, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyForJob,
  getJobSeekerApplications,
  getJobApplicants,
  updateApplicationStatus,
};
