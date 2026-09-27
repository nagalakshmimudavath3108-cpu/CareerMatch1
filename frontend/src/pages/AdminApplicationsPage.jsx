import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileCheck, Building, User } from 'lucide-react';

export const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/admin/applications');
        if (res.data.success) {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching applications log..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Applications Audit</h1>
        <p className="text-xs text-slate-500 mt-1">Global log of candidate applications and algorithm match scores.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-4">Candidate</th>
              <th className="p-4">Job & Company</th>
              <th className="p-4">Match Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Applied Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">{app.jobSeeker?.name} ({app.jobSeeker?.email})</td>
                <td className="p-4">
                  <span className="font-semibold text-slate-800">{app.job?.title}</span>
                  <p className="text-[11px] text-slate-400">{app.job?.companyName}</p>
                </td>
                <td className="p-4 font-bold text-brand-600">{app.matchPercentage}%</td>
                <td className="p-4"><Badge status={app.status} /></td>
                <td className="p-4 text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminApplicationsPage;
