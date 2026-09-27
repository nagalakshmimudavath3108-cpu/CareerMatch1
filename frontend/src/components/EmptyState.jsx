import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No data found', description = 'There are no items to display at this moment.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm my-4">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
        <Inbox className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
