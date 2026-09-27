import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Calendar, Clock, Video, Building, ExternalLink } from 'lucide-react';

export const InterviewsPage = () => {
  const { socket } = useSocket();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      if (res.data.success) {
        setInterviews(res.data.interviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Real-Time Socket Listener for Interview Scheduling & Updates
  useEffect(() => {
    if (!socket) return;

    const handleInterviewEvent = () => {
      fetchInterviews();
    };

    socket.on('interview_scheduled', handleInterviewEvent);
    socket.on('interview_updated', handleInterviewEvent);

    return () => {
      socket.off('interview_scheduled', handleInterviewEvent);
      socket.off('interview_updated', handleInterviewEvent);
    };
  }, [socket]);

  if (loading) return <LoadingSpinner text="Loading interview schedule..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scheduled Interviews</h1>
        <p className="text-xs text-slate-500 mt-1">
          View video call links, meeting schedules, and interview instructions.
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          title="No Scheduled Interviews"
          description="When recruiters schedule an interview for your applications, it will appear here in real-time."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {interviews.map((int) => (
            <div
              key={int._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                      {int.status}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1.5">{int.title}</h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" /> {int.job?.companyName || 'Company'} — {int.job?.title}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>{new Date(int.scheduledAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duration: {int.durationMinutes} Minutes</span>
                  </div>
                </div>

                {int.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2 rounded-xl border border-slate-100">
                    {int.description}
                  </p>
                )}
              </div>

              {int.meetingLink && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={int.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Video className="w-4 h-4" /> Launch Video Meeting <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewsPage;
