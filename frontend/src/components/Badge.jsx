import React from 'react';

export const Badge = ({ status }) => {
  const getBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shortlisted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'interview_scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hired':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.replace('_', ' ').toUpperCase();
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle(status)}`}>
      {formatText(status)}
    </span>
  );
};

export default Badge;
