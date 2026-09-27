import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const getSocketTarget = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      if (import.meta.env.DEV) return 'http://127.0.0.1:5000';
      return window.location.origin;
    };

    const newSocket = io(getSocketTarget(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket Connected:', newSocket.id);
    });

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
