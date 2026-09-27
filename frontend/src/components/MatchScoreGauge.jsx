import React from 'react';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export const MatchScoreGauge = ({ matchPercentage = 0, matchingSkills = [], missingSkills = [], compact = false }) => {
  const getMatchColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getMatchColor(matchPercentage)}`}>
        <Sparkles className="w-3.5 h-3.5" />
        <span>{matchPercentage}% Match</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">CareerMatch Analysis</h4>
            <p className="text-xs text-slate-500">Skill alignment calculation</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-xl text-lg font-bold border ${getMatchColor(matchPercentage)}`}>
          {matchPercentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(matchPercentage)}`}
          style={{ width: `${matchPercentage}%` }}
        />
      </div>

      {/* Skills breakdown */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {matchingSkills.length > 0 && (
          <div>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Matched Skills ({matchingSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mb-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-500" /> Missing Required Skills ({missingSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchScoreGauge;
