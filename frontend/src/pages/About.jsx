import React from 'react';
import { Briefcase, Sparkles, Shield, Zap, CheckCircle } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-brand-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
          <Briefcase className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">About CareerMatch</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          The real-time recruitment platform engineered for transparent skill matching and instant recruiter collaboration.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Explainable Skill Match</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every candidate receives an un-biased, transparent match score calculated directly from matched and missing required job skills.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Socket.IO Real-Time Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Live applicant notifications, real-time application status progression, candidate chat, and instant interview calendar updates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Role-Based Ecosystem</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Role-specific dashboards for Job Seekers, Company Recruiters, and Platform Administrators with audit controls.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
