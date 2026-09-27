import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in ${
            toast.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-50/95 border-rose-200 text-rose-900'
              : 'bg-brand-50/95 border-brand-200 text-brand-900'
          }`}
        >
          <div className="mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : toast.type === 'error' ? (
              <X className="w-5 h-5 text-rose-600" />
            ) : (
              <Bell className="w-5 h-5 text-brand-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold">{toast.title}</h4>
            <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
