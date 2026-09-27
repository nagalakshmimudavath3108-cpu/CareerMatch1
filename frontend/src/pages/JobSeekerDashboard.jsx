import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MatchScoreGauge from '../components/MatchScoreGauge';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, FileCheck, Calendar, Sparkles, MessageSquare, ArrowRight, UserCheck } from 'lucide-react';

export const JobSeekerDashboard = () => {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appRes, intRes, jobsRes] = await Promise.all([
          api.get('/applications/my-applications'),
          api.get('/interviews'),
          api.get('/jobs?limit=3'),
        ]);

        if (appRes.data.success) setApplications(appRes.data.applications);
        if (intRes.data.success) setInterviews(intRes.data.interviews);
        if (jobsRes.data.success) setRecommendedJobs(jobsRes.data.jobs);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading candidate portal..." />;

  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const interviewCount = interviews.filter((i) => i.status === 'scheduled').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> CareerMatch Job Seeker Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-1">
            {profile?.skills?.length || 0} Skills Configured • {applications.length} Applications Active
          </p>
        </div>

        <Link
          to="/jobseeker/profile"
          className="px-5 py-2.5 bg-white text-brand-700 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition-colors"
        >
          Update Profile & Skills
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FileCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{applications.length}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Applied Jobs</p>
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
          <span className="text-2xl font-extrabold text-slate-900">{interviewCount}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Interviews Scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{profile?.skills?.length || 0}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Matched Skills</p>
        </div>
      </div>

      {/* Scheduled Interviews & Active Applications Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Applications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-600" /> Recent Applications
            </h3>
            <Link to="/jobseeker/applications" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No active job applications yet.</div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{app.job?.title}</h4>
                    <p className="text-[11px] text-slate-500">{app.job?.companyName}</p>
                    <span className="text-[10px] text-brand-600 font-semibold mt-1 inline-block">
                      Skill Match Score: {app.matchPercentage}%
                    </span>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Interviews */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" /> Scheduled Interviews
            </h3>
            <Link to="/jobseeker/interviews" className="text-xs font-bold text-amber-600 hover:text-amber-700">
              View Schedule
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No scheduled interviews at the moment.</div>
          ) : (
            <div className="space-y-3">
              {interviews.slice(0, 3).map((int) => (
                <div
                  key={int._id}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-slate-900">{int.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                      {new Date(int.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">Company: {int.job?.companyName}</p>
                  {int.meetingLink && (
                    <a
                      href={int.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline pt-1"
                    >
                      Join Meeting Link <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-900">Recommended Jobs For You</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {recommendedJobs.map((job) => (
            <div key={job._id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">{job.title}</h4>
                <p className="text-xs text-slate-500 mb-3">{job.companyName}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {job.requiredSkills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to={`/jobs/${job._id}`}
                className="w-full py-2 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-center font-bold text-xs rounded-xl transition-colors"
              >
                View Job
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
