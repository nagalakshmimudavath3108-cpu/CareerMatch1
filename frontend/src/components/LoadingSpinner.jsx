import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ fullScreen = false, text = 'Loading CareerMatch Engine...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600 tracking-wide">{text}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-2">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      <span className="text-xs font-medium text-slate-500">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
