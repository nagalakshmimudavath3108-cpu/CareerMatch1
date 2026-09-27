import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Briefcase, Mail, Lock, User, Building, ArrowRight, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'jobseeker';

  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    companyName: '',
    headline: '',
    skills: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields (Name, Email, and Password).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData);
      addToast('Account Created!', `Welcome to CareerMatch, ${res.user?.name || 'User'}!`, 'success');

      if (res.user?.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/jobseeker/dashboard');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create account.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Create CareerMatch Account</h2>
        <p className="text-xs text-slate-500">Join the real-time recruitment platform</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'jobseeker' })}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              formData.role === 'jobseeker' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Job Seeker / Candidate
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'recruiter' })}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              formData.role === 'recruiter' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            I am a Recruiter / Company
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@company.com"
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
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {formData.role === 'recruiter' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. TechCorp Solutions"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Headline / Tagline</label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer specializing in React & Node.js"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Technical Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB, JavaScript, Git"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}{' '}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
