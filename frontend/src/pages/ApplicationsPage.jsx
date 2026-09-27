import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import Badge from '../components/Badge';
import MatchScoreGauge from '../components/MatchScoreGauge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { FileCheck, MessageSquare, Building, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

export const ApplicationsPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Real-Time Socket Listener for Live Status Updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdated = () => {
      fetchApplications();
    };

    socket.on('application_status_updated', handleStatusUpdated);

    return () => {
      socket.off('application_status_updated', handleStatusUpdated);
    };
  }, [socket]);

  if (loading) return <LoadingSpinner text="Fetching job applications..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Job Applications</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track real-time status updates and recruitment timeline for positions you applied to.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description="Explore available jobs and apply using your transparent skill match profile."
          action={
            <Link to="/jobs" className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl">
              Browse Open Jobs
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-200 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 mt-0.5">{app.job?.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> {app.job?.companyName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge status={app.status} />
                  <Link
                    to={`/messages?applicationId=${app._id}`}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat Recruiter
                  </Link>
                </div>
              </div>

              {/* Match Gauge */}
              <MatchScoreGauge
                matchPercentage={app.matchPercentage}
                matchingSkills={app.matchingSkills}
                missingSkills={app.missingSkills}
              />

              {/* Status Timeline */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-3">Application Progression:</span>
                <div className="flex flex-wrap items-center gap-3">
                  {app.timeline?.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                        <span className="capitalize">{step.status.replace('_', ' ')}</span>
                      </div>
                      {idx < app.timeline.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
