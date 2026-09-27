import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Building2, Globe, MapPin, Phone, Users, Save } from 'lucide-react';

export const CompanyProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { addToast } = useNotifications();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companyBio: '',
    industry: 'Technology',
    companySize: '1-50 employees',
    location: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        companyWebsite: profile.companyWebsite || '',
        companyBio: profile.companyBio || '',
        industry: profile.industry || 'Technology',
        companySize: profile.companySize || '1-50 employees',
        location: profile.location || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put('/profiles/recruiter', formData);
      if (res.data.success) {
        addToast('Company Profile Updated', 'Your recruiter organization details were updated', 'success');
        refreshProfile();
      }
    } catch (err) {
      addToast('Error Updating Profile', err.response?.data?.message || 'Failed to update company profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">This information is shown on your job postings to candidates.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-600" /> Organization Specifications
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="https://company.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="Software, Healthcare, Finance..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="1-10 employees">1-10 employees</option>
              <option value="11-50 employees">11-50 employees</option>
              <option value="51-200 employees">51-200 employees</option>
              <option value="201-500 employees">201-500 employees</option>
              <option value="500+ employees">500+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="San Francisco, CA"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Contact</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555-0199"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Company Overview / Mission</label>
          <textarea
            rows={4}
            name="companyBio"
            value={formData.companyBio}
            onChange={handleChange}
            placeholder="Describe your company culture, technology stack, and mission..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Company Details'}
        </button>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
