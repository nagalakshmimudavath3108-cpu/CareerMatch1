import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Briefcase, Bell, MessageSquare, User, LogOut, ShieldCheck, ChevronDown, Check } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/jobs';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'recruiter') return '/recruiter/dashboard';
    return '/jobseeker/dashboard';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  Career<span className="text-brand-600">Match</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                  Real-Time Talent Hub
                </span>
              </div>
            </Link>

            {/* Public Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/jobs"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/jobs' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Browse Jobs
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/about' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                About Platform
              </Link>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  {user.role.toUpperCase()} DASHBOARD
                </Link>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.read ? 'bg-brand-50/40' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden border border-slate-200">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-900">{user.name}</span>
                      <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-brand-600" /> Dashboard
                        </Link>
                        {user.role === 'jobseeker' && (
                          <Link
                            to="/jobseeker/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-slate-400" /> My Profile
                          </Link>
                        )}
                        {user.role === 'recruiter' && (
                          <Link
                            to="/recruiter/company"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-slate-400" /> Company Profile
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-xl shadow-md shadow-brand-500/20 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
