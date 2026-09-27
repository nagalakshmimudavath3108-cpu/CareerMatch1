import React from 'react';

export const SkillBadge = ({ skill, matched = false, missing = false }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (matched) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
  } else if (missing) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs border ${style}`}>
      {skill}
    </span>
  );
};

export default SkillBadge;
