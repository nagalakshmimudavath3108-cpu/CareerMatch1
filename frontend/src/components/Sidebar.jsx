import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileCheck,
  Bell,
  MessageSquare,
  Calendar,
  Settings,
  PlusCircle,
  Users,
  BarChart3,
  Building2,
  Shield,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const jobSeekerLinks = [
    { to: '/jobseeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobseeker/profile', label: 'My Profile', icon: User },
    { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    { to: '/jobseeker/applications', label: 'My Applications', icon: FileCheck },
    { to: '/jobseeker/interviews', label: 'Interviews', icon: Calendar },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/jobseeker/settings', label: 'Settings', icon: Settings },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/create-job', label: 'Post New Job', icon: PlusCircle },
    { to: '/recruiter/my-jobs', label: 'My Job Postings', icon: Briefcase },
    { to: '/recruiter/applicants', label: 'All Applicants', icon: Users },
    { to: '/recruiter/interviews', label: 'Interviews', icon: Calendar },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/recruiter/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/recruiter/company', label: 'Company Profile', icon: Building2 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/recruiters', label: 'Recruiters', icon: Building2 },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
    { to: '/admin/applications', label: 'Applications', icon: FileCheck },
    { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
  ];

  const links =
    user.role === 'admin'
      ? adminLinks
      : user.role === 'recruiter'
      ? recruiterLinks
      : jobSeekerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        <div className="px-3 py-2 mb-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user.role === 'admin' ? <Shield className="w-4 h-4" /> : user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
            <p className="text-[10px] text-slate-500 capitalize">{user.role} Portal</p>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-medium">CareerMatch Engine v1.0</p>
        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-1" />
        <span className="text-[10px] text-emerald-600 font-semibold ml-1.5">Socket Connected</span>
      </div>
    </aside>
  );
};

export default Sidebar;
