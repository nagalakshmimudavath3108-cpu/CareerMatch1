import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import EmptyState from '../components/EmptyState';
import { Bell, Check, ExternalLink } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for job applications, chat, and interviews.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No Notifications" description="You're all caught up! New real-time alerts will appear here." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                markAsRead(n._id);
                if (n.link) navigate(n.link);
              }}
              className={`p-5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-4 ${
                !n.read ? 'bg-brand-50/30' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  !n.read ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                {n.link && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 mt-2 hover:underline">
                    View Details <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
