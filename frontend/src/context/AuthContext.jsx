import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('careermatch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('careermatch_token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem('careermatch_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('careermatch_token', res.data.token);
      localStorage.setItem('careermatch_user', JSON.stringify(res.data.user));
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
          setProfile(meRes.data.profile);
        }
      } catch (err) {
        console.warn('Could not load profile details immediately:', err);
      }
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('careermatch_token', res.data.token);
      localStorage.setItem('careermatch_user', JSON.stringify(res.data.user));
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data.success) {
          setProfile(meRes.data.profile);
        }
      } catch (err) {
        console.warn('Could not load profile details immediately:', err);
      }
      return res.data;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('careermatch_token');
    localStorage.removeItem('careermatch_user');
  };

  const refreshProfile = async () => {
    if (token) {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
