import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Briefcase, GraduationCap, Code, FileText, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export const CandidateDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await api.get(`/profiles/jobseeker/${id}`);
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  if (loading) return <LoadingSpinner text="Fetching candidate profile..." />;
  if (!profile) return <div className="p-8 text-center text-slate-500">Candidate profile unavailable.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-bold text-2xl flex items-center justify-center shadow">
            {profile.user?.avatar ? (
              <img src={profile.user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              profile.user?.name?.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{profile.user?.name}</h1>
            <p className="text-xs font-semibold text-brand-600 mt-0.5">{profile.headline || 'Candidate'}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile.user?.email}</span>
              {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">About Candidate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        <div>
          <h3 className="font-bold text-sm text-slate-900 mb-2">Technical Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills?.map((s, idx) => (
              <span key={idx} className="px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        {profile.experience?.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-brand-600" /> Work Experience
            </h3>
            <div className="space-y-2">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.role} @ {exp.company}</span>
                    <span className="text-[10px] text-slate-400">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  {exp.description && <p className="text-slate-600 mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
