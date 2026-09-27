const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { notifyUser } = require('../sockets/socket');

// @desc    Schedule an interview
// @route   POST /api/interviews
// @access  Private (Recruiter/Admin)
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, title, description, scheduledAt, durationMinutes, meetingLink, location, notes } = req.body;

    const application = await Application.findById(applicationId)
      .populate('job', 'title companyName')
      .populate('jobSeeker', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to schedule interview for this application' });
    }

    const interview = await Interview.create({
      application: applicationId,
      job: application.job._id,
      candidate: application.jobSeeker._id,
      recruiter: req.user.id,
      title: title || `Interview for ${application.job.title}`,
      description: description || '',
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 45,
      meetingLink: meetingLink || 'https://meet.google.com/careermatch-demo',
      location: location || 'Online Video Call',
      notes: notes || '',
      status: 'scheduled',
    });

    // Update application status
    application.status = 'interview_scheduled';
    application.timeline.push({
      status: 'interview_scheduled',
      note: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      updatedAt: new Date(),
    });
    await application.save();

    // Notification for Candidate
    const notification = await Notification.create({
      recipient: application.jobSeeker._id,
      sender: req.user.id,
      type: 'interview_scheduled',
      title: '📅 Interview Invitation!',
      message: `You have an interview scheduled for "${application.job.title}" on ${new Date(scheduledAt).toLocaleString()}.`,
      link: '/jobseeker/interviews',
    });

    // Emit Real-time Socket Event to Candidate and Recruiter
    notifyUser(application.jobSeeker._id, 'interview_scheduled', {
      interview,
      jobTitle: application.job.title,
      companyName: application.job.companyName,
      notification,
    });

    notifyUser(req.user.id, 'interview_scheduled', {
      interview,
      jobTitle: application.job.title,
      companyName: application.job.companyName,
      notification,
    });

    res.status(201).json({ success: true, message: 'Interview scheduled successfully', interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's scheduled interviews
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'jobseeker') {
      query.candidate = req.user.id;
    } else if (req.user.role === 'recruiter') {
      query.recruiter = req.user.id;
    }

    const interviews = await Interview.find(query)
      .populate('job', 'title companyName location')
      .populate('candidate', 'name email avatar')
      .populate('recruiter', 'name email avatar')
      .sort({ scheduledAt: 1 });

    res.json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update interview status or details
// @route   PUT /api/interviews/:id
// @access  Private
const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (
      interview.recruiter.toString() !== req.user.id &&
      interview.candidate.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this interview' });
    }

    const updatedInterview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('job', 'title companyName')
      .populate('candidate', 'name email')
      .populate('recruiter', 'name email');

    // Notify both candidate and recruiter of real-time update
    notifyUser(interview.candidate, 'interview_updated', { interview: updatedInterview });
    notifyUser(interview.recruiter, 'interview_updated', { interview: updatedInterview });

    res.json({ success: true, message: 'Interview updated successfully', interview: updatedInterview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  updateInterview,
};
