import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import MatchScoreGauge from '../components/MatchScoreGauge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building, MapPin, DollarSign, Calendar, Sparkles, Send, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          setJob(res.data.job);
        }
        if (user && user.role === 'jobseeker') {
          const appRes = await api.get('/applications/my-applications');
          if (appRes.data.success) {
            const applied = appRes.data.applications.some((app) => app.job._id === id);
            setHasApplied(applied);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      const res = await api.post(`/applications/apply/${id}`, { coverLetter });
      if (res.data.success) {
        addToast('Application Submitted!', 'Recruiter has received your application in real-time.', 'success');
        setHasApplied(true);
        setShowApplyModal(false);
      }
    } catch (err) {
      addToast('Application Failed', err.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching job specifications..." />;
  if (!job) return <div className="p-8 text-center text-slate-500">Job position not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to positions
      </Link>

      {/* Main Job Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
              {job.department || 'Engineering'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4 text-slate-400" /> {job.companyName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
              </span>
              <span className="flex items-center gap-1 text-brand-600 font-bold">
                <DollarSign className="w-4 h-4" /> ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / yr
              </span>
            </div>
          </div>

          {user && user.role === 'jobseeker' && (
            <div className="w-full sm:w-auto">
              {hasApplied ? (
                <div className="px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Application Submitted
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" /> Apply Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Skill Match Breakdown for Candidate */}
        {user && user.role === 'jobseeker' && (
          <MatchScoreGauge
            matchPercentage={job.matchPercentage || 0}
            matchingSkills={job.matchingSkills || []}
            missingSkills={job.missingSkills || []}
          />
        )}
      </div>

      {/* Description & Details */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Position Overview
            </h3>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Required Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block mb-2">Nice to Have Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {job.niceToHaveSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company & Recruiter Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              About Hiring Team
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Company</span>
                <span className="font-semibold text-slate-800">{job.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Recruiter Contact</span>
                <span className="font-semibold text-slate-800">{job.recruiter?.name || 'Recruitment Team'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Employment Type</span>
                <span className="font-semibold text-slate-800 capitalize">{job.type}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Experience Level</span>
                <span className="font-semibold text-slate-800">{job.experienceLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900">
            <span className="font-bold">Match Score: {job.matchPercentage || 0}%</span>
            <p className="text-[11px] text-brand-700 mt-0.5">
              Your candidate profile skills match {job.matchingSkills?.length || 0} out of {job.requiredSkills?.length || 0} required skills.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cover Letter / Introduction (Optional)
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight why you are an ideal fit for this role..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {applying ? 'Submitting Application...' : 'Confirm & Send Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetailsPage;
