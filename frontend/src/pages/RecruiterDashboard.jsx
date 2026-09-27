import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import MatchScoreGauge from '../components/MatchScoreGauge';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, Users, UserCheck, Calendar, PlusCircle, MessageSquare, Check, X, Sparkles, Building } from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user, profile } = useAuth();
  const { addToast } = useNotifications();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedApp, setSelectedApp] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: '',
    scheduledAt: '',
    durationMinutes: 45,
    meetingLink: '',
    description: '',
  });

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, intRes] = await Promise.all([
        api.get('/jobs/recruiter/myjobs'),
        api.get('/applications/applicants'),
        api.get('/interviews'),
      ]);

      if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
      if (appsRes.data.success) setApplicants(appsRes.data.applications);
      if (intRes.data.success) setInterviews(intRes.data.interviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status });
      if (res.data.success) {
        addToast('Status Updated', `Candidate application marked as ${status}`, 'success');
        fetchData();
      }
    } catch (err) {
      addToast('Update Error', err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/interviews', {
        applicationId: selectedApp._id,
        ...scheduleData,
      });
      if (res.data.success) {
        addToast('Interview Scheduled!', 'Candidate has received notification in real-time.', 'success');
        setShowScheduleModal(false);
        fetchData();
      }
    } catch (err) {
      addToast('Scheduling Failed', err.response?.data?.message || 'Failed to schedule interview', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading recruiter command center..." />;

  const shortlistedCount = applicants.filter((a) => a.status === 'shortlisted').length;

  return (
    <div className="space-y-8">
      {/* Recruiter Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold mb-2 backdrop-blur-md">
            <Building className="w-3.5 h-3.5" /> {profile?.companyName || 'Recruiter Portal'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Hiring Workspace</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            {jobs.length} Active Positions • {applicants.length} Candidates Evaluated
          </p>
        </div>

        <Link
          to="/recruiter/create-job"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Create Job Posting
        </Link>
      </div>

      {/* Recruiter Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{jobs.length}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Posted Jobs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{applicants.length}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Total Candidates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <UserCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{shortlistedCount}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Shortlisted</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{interviews.length}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Interviews Scheduled</p>
        </div>
      </div>

      {/* Top Ranked Applicants Stream */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" /> Rank-Ordered Applicants
            </h3>
            <p className="text-xs text-slate-500">Sorted automatically by CareerMatch algorithm score</p>
          </div>
          <Link to="/recruiter/applicants" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View All Applicants
          </Link>
        </div>

        {applicants.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No candidate applications received yet.</div>
        ) : (
          <div className="space-y-3">
            {applicants.slice(0, 5).map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {app.jobSeeker?.avatar ? (
                      <img src={app.jobSeeker.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      app.jobSeeker?.name?.charAt(0) || 'C'
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{app.jobSeeker?.name}</h4>
                    <p className="text-xs text-slate-500">Position: {app.job?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {app.matchPercentage}% Skill Match Score
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Badge status={app.status} />

                  <button
                    onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs rounded-xl transition-colors"
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setScheduleData({ ...scheduleData, title: `Interview for ${app.job?.title}` });
                      setShowScheduleModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs rounded-xl transition-colors"
                  >
                    Schedule Interview
                  </button>

                  <Link
                    to={`/messages?applicationId=${app._id}`}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={`Schedule Interview with ${selectedApp?.jobSeeker?.name}`}
      >
        <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Notes for Candidate</label>
            <textarea
              rows={3}
              value={scheduleData.description}
              onChange={(e) => setScheduleData({ ...scheduleData, description: e.target.value })}
              placeholder="Provide context on topics to cover..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
              Send Interview Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;
