import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Shield, Users, Building2, Briefcase, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner text="Gathering platform statistics..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" /> Platform Administrator Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">System Dashboard</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Monitoring {stats?.totalUsers} total users across {stats?.totalJobs} job listings.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats?.totalUsers}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Total Users ({stats?.totalJobSeekers} Seekers / {stats?.totalRecruiters} Recruiters)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats?.totalJobs}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Job Openings ({stats?.activeJobs} Active)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FileCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats?.totalApplications}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Applications Processed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats?.totalHired}</span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Hired Candidates</p>
        </div>
      </div>

      {/* Top Required Skills Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" /> Top In-Demand Technical Skills Across Open Positions
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.topSkills || []}>
              <XAxis dataKey="skill" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
