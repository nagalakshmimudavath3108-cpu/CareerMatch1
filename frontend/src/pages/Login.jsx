import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Briefcase, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      addToast('Welcome Back!', `Signed in as ${res.user.name}`, 'success');

      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/jobseeker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo convenience
  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to CareerMatch</h2>
        <p className="text-xs text-slate-500">Access your real-time candidate & recruiter portal</p>
      </div>

      {/* Quick Demo Login Preset Buttons */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600" /> Demo Quick Login Accounts:
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => fillDemo('alex@example.com', 'password123')}
            className="p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100 font-medium text-slate-700 text-left transition-colors"
          >
            <span className="font-bold block text-slate-900">Job Seeker</span> alex@example.com
          </button>
          <button
            type="button"
            onClick={() => fillDemo('recruiter@techcorp.com', 'password123')}
            className="p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100 font-medium text-slate-700 text-left transition-colors"
          >
            <span className="font-bold block text-slate-900">Recruiter</span> recruiter@techcorp.com
          </button>
          <button
            type="button"
            onClick={() => fillDemo('admin@careermatch.com', 'password123')}
            className="col-span-2 p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100 font-medium text-slate-700 text-left transition-colors"
          >
            <span className="font-bold block text-slate-900">Admin</span> admin@careermatch.com
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
