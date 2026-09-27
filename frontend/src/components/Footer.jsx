import React from 'react';
import { Briefcase, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-slate-900">
            Career<span className="text-brand-600">Match</span>
          </span>
          <span className="text-xs text-slate-400">© 2026. Real-Time Talent & Opportunity Platform.</span>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          Built for modern recruitment & candidate matching.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
