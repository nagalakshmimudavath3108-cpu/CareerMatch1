import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building2, Globe, Mail, Shield } from 'lucide-react';

export const AdminRecruitersPage = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const res = await api.get('/admin/users?role=recruiter');
        if (res.data.success) {
          setRecruiters(res.data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiters();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching recruiter directory..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registered Recruiters & Companies</h1>
        <p className="text-xs text-slate-500 mt-1">Directory of hiring teams active on CareerMatch.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {recruiters.map((r) => (
          <div key={r._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0">
              {r.name.charAt(0)}
            </div>
            <div className="space-y-1 text-xs">
              <h3 className="font-bold text-sm text-slate-900">{r.name}</h3>
              <p className="text-slate-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {r.email}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] mt-1">
                Verified Recruiter Account
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRecruitersPage;
