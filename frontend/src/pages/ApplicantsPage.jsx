import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import MatchScoreGauge from '../components/MatchScoreGauge';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Users, Filter, Check, X, Calendar, MessageSquare, FileText, ExternalLink, Sparkles } from 'lucide-react';

export const ApplicantsPage = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useNotifications();
  const { socket } = useSocket();

  const [applicants, setApplicants] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(searchParams.get('jobId') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [minMatch, setMinMatch] = useState('');

  const [selectedApp, setSelectedApp] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: '',
    scheduledAt: '',
    durationMinutes: 45,
    meetingLink: '',
    description: '',
  });

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (minMatch) queryParams.append('minMatch', minMatch);

      const url = selectedJob ? `/applications/applicants/${selectedJob}` : '/applications/applicants';
      const [appRes, jobsRes] = await Promise.all([
        api.get(`${url}?${queryParams.toString()}`),
        api.get('/jobs/recruiter/myjobs'),
      ]);

      if (appRes.data.success) setApplicants(appRes.data.applications);
      if (jobsRes.data.success) setMyJobs(jobsRes.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [selectedJob, statusFilter, minMatch]);

  // Real-Time Socket Listeners for Live Applicants Page Updates
  useEffect(() => {
    if (!socket) return;

    const handleNewApplicant = () => {
      fetchApplicants();
    };

    const handleStatusUpdated = () => {
      fetchApplicants();
    };

    socket.on('new_applicant', handleNewApplicant);
    socket.on('application_status_updated', handleStatusUpdated);

    return () => {
      socket.off('new_applicant', handleNewApplicant);
      socket.off('application_status_updated', handleStatusUpdated);
    };
  }, [socket, selectedJob, statusFilter, minMatch]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status });
      if (res.data.success) {
        addToast('Status Changed', `Candidate status updated to ${status}`, 'success');
        fetchApplicants();
      }
    } catch (err) {
      addToast('Update Failed', err.response?.data?.message || 'Failed to update candidate status', 'error');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/interviews', {
        applicationId: selectedApp._id,
        ...scheduleData,
      });
      if (res.data.success) {
        addToast('Interview Scheduled!', 'Notification emitted to candidate in real-time.', 'success');
        setShowScheduleModal(false);
        fetchApplicants();
      }
    } catch (err) {
      addToast('Scheduling Failed', err.response?.data?.message || 'Failed to schedule interview', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Candidate Applicant Portal</h1>
        <p className="text-xs text-slate-500 mt-1">Review candidates ranked by CareerMatch skill alignment score.</p>
      </div>

      {/* Filtering Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter Position</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="">All Job Postings ({myJobs.length})</option>
            {myJobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Application Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>

        <div className="w-36">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Match Score</label>
          <select
            value={minMatch}
            onChange={(e) => setMinMatch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="">Any Match %</option>
            <option value="80">80%+ (Top Match)</option>
            <option value="50">50%+ (Medium Match)</option>
          </select>
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <LoadingSpinner text="Evaluating candidate rank list..." />
      ) : applicants.length === 0 ? (
        <EmptyState title="No Applicants Found" description="No candidates fit the selected filter parameters." />
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-200 transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow">
                    {app.jobSeeker?.avatar ? (
                      <img src={app.jobSeeker.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      app.jobSeeker?.name?.charAt(0) || 'C'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{app.jobSeeker?.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Position Applied: {app.job?.title}</p>
                    <p className="text-[11px] text-slate-400">Email: {app.jobSeeker?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge status={app.status} />

                  <button
                    onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs rounded-xl transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1" /> Shortlist
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(app._id, 'rejected')}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors"
                  >
                    <X className="w-3.5 h-3.5 inline mr-1" /> Reject
                  </button>

                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setScheduleData({ ...scheduleData, title: `Interview for ${app.job?.title}` });
                      setShowScheduleModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs rounded-xl transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 inline mr-1" /> Schedule
                  </button>

                  <Link
                    to={`/messages?applicationId=${app._id}`}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-600"
                    title="Direct Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Match Gauge */}
              <MatchScoreGauge
                matchPercentage={app.matchPercentage}
                matchingSkills={app.matchingSkills}
                missingSkills={app.missingSkills}
              />

              {app.coverLetter && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Cover Letter:</span>
                  <p className="line-clamp-3">{app.coverLetter}</p>
                </div>
              )}

              {app.resumeUrl && (
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" /> Download Candidate Resume <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={`Schedule Interview with ${selectedApp?.jobSeeker?.name}`}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Title</label>
            <input
              type="text"
              required
              value={scheduleData.title}
              onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={scheduleData.scheduledAt}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={scheduleData.durationMinutes}
                onChange={(e) => setScheduleData({ ...scheduleData, durationMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Link (e.g. Google Meet)</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={scheduleData.meetingLink}
              onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Confirm Interview Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApplicantsPage;
