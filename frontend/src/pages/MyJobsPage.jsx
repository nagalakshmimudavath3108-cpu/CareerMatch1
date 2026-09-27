import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Briefcase, PlusCircle, Users, Edit3, Trash2, MapPin, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';

export const MyJobsPage = () => {
  const { addToast } = useNotifications();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/recruiter/myjobs');
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      const res = await api.put(`/jobs/${jobId}`, { status: newStatus });
      if (res.data.success) {
        addToast('Job Status Updated', `Position status changed to ${newStatus}`, 'success');
        fetchMyJobs();
      }
    } catch (err) {
      addToast('Update Failed', err.response?.data?.message || 'Failed to update job status', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        addToast('Job Deleted', 'Posting removed from platform', 'info');
        fetchMyJobs();
      }
    } catch (err) {
      addToast('Delete Failed', err.response?.data?.message || 'Failed to delete job', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Fetching active job postings..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Job Postings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage, edit, or close job openings created by your team.</p>
        </div>

        <Link
          to="/recruiter/create-job"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Create New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No Job Postings"
          description="You haven't created any job openings yet."
          action={
            <Link to="/recruiter/create-job" className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl">
              Create First Job
            </Link>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      job.status === 'open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {job.status}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 mt-1.5">{job.title}</h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(job._id, job.status)}
                    title="Toggle Open/Closed"
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {job.status === 'open' ? <ToggleRight className="w-6 h-6 text-emerald-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold">{job.type}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to={`/recruiter/applicants?jobId=${job._id}`}
                  className="font-bold text-brand-600 hover:underline flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" /> View Applicants ({job.applicantsCount || 0})
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/recruiter/edit-job/${job._id}`}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                    title="Edit Job"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;
