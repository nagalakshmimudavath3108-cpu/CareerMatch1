import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle } from 'lucide-react';

export const RecruiterAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const appsRes = await api.get('/applications/applicants');
        if (appsRes.data.success) {
          const apps = appsRes.data.applications;

          // Process match distribution
          const matchBuckets = [
            { name: '90-100%', count: apps.filter((a) => a.matchPercentage >= 90).length },
            { name: '75-89%', count: apps.filter((a) => a.matchPercentage >= 75 && a.matchPercentage < 90).length },
            { name: '50-74%', count: apps.filter((a) => a.matchPercentage >= 50 && a.matchPercentage < 75).length },
            { name: '<50%', count: apps.filter((a) => a.matchPercentage < 50).length },
          ];

          // Process status distribution
          const statusCounts = [
            { name: 'Applied', value: apps.filter((a) => a.status === 'applied').length },
            { name: 'Shortlisted', value: apps.filter((a) => a.status === 'shortlisted').length },
            { name: 'Interviewed', value: apps.filter((a) => a.status === 'interview_scheduled').length },
            { name: 'Hired', value: apps.filter((a) => a.status === 'hired').length },
            { name: 'Rejected', value: apps.filter((a) => a.status === 'rejected').length },
          ];

          setStats({ matchBuckets, statusCounts, total: apps.length });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  if (loading) return <LoadingSpinner text="Computing recruiter analytics..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recruiter Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">Data insights into applicant match distribution and hiring funnel performance.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Match score distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" /> Skill Match Score Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.matchBuckets || []}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Applicant Status Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusCounts || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.statusCounts?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold">
            {stats?.statusCounts?.map((st, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {st.name}: {st.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalyticsPage;
