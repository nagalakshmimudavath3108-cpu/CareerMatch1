import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewApplicant = (data) => {
      addToast('New Applicant Received!', `${data.candidateName} applied for ${data.jobTitle} (${data.matchPercentage}% match)`, 'success');
      setUnreadCount((prev) => prev + 1);
      fetchNotifications();
    };

    const handleStatusUpdated = (data) => {
      addToast('Application Status Updated', `Your application for "${data.jobTitle}" is now ${data.newStatus}`, 'info');
      setUnreadCount((prev) => prev + 1);
      fetchNotifications();
    };

    const handleInterviewScheduled = (data) => {
      addToast('📅 Interview Scheduled!', `Interview set for "${data.jobTitle}"`, 'success');
      setUnreadCount((prev) => prev + 1);
      fetchNotifications();
    };

    const handleInterviewUpdated = (data) => {
      addToast('📅 Interview Updated!', `Details updated for "${data.interview?.title || 'your interview'}"`, 'info');
      fetchNotifications();
    };

    const handleChatNotification = (data) => {
      addToast(`💬 Message from ${data.senderName}`, data.message.text, 'info');
      setUnreadCount((prev) => prev + 1);
      fetchNotifications();
    };

    const handleJobCreated = (job) => {
      if (user?.role === 'jobseeker') {
        addToast('✨ New Job Posted!', `${job.companyName} posted "${job.title}"`, 'info');
      }
    };

    socket.on('new_applicant', handleNewApplicant);
    socket.on('application_status_updated', handleStatusUpdated);
    socket.on('interview_scheduled', handleInterviewScheduled);
    socket.on('interview_updated', handleInterviewUpdated);
    socket.on('chat_notification', handleChatNotification);
    socket.on('job_created', handleJobCreated);

    return () => {
      socket.off('new_applicant', handleNewApplicant);
      socket.off('application_status_updated', handleStatusUpdated);
      socket.off('interview_scheduled', handleInterviewScheduled);
      socket.off('interview_updated', handleInterviewUpdated);
      socket.off('chat_notification', handleChatNotification);
      socket.off('job_created', handleJobCreated);
    };
  }, [socket, user]);

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        fetchNotifications,
        markAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
