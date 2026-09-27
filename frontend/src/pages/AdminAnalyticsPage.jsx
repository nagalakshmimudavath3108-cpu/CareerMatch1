import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Shield } from 'lucide-react';

export const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Computing global platform analytics..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Growth & Matching Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">High-level telemetry on skill demand and recruitment funnel efficiency.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" /> Skill Demand Volume (Top 10 Required Skills)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.topSkills || []}>
              <XAxis dataKey="skill" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
