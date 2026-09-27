import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, Trash2, Building, MapPin } from 'lucide-react';

export const AdminJobsPage = () => {
  const { addToast } = useNotifications();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/admin/jobs');
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
    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job posting as Administrator?')) return;
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        addToast('Job Removed', 'Job listing removed by admin audit', 'info');
        fetchJobs();
      }
    } catch (err) {
      addToast('Delete Failed', err.response?.data?.message || 'Failed to remove job', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Fetching platform job postings..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Job Postings</h1>
        <p className="text-xs text-slate-500 mt-1">Audit and moderate all job listings published on CareerMatch.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-4">Job Position</th>
              <th className="p-4">Company & Recruiter</th>
              <th className="p-4">Status</th>
              <th className="p-4">Applicants</th>
              <th className="p-4 text-right">Moderate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {jobs.map((job) => (
              <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <h4 className="font-bold text-slate-900">{job.title}</h4>
                  <p className="text-[11px] text-slate-500">{job.location} • {job.type}</p>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-slate-800">{job.companyName}</span>
                  <p className="text-[11px] text-slate-400">{job.recruiter?.name}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    job.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-900">{job.applicantsCount || 0}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminJobsPage;
