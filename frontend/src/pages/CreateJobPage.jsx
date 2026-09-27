import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Briefcase, PlusCircle, ArrowLeft } from 'lucide-react';

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    type: 'full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 90000,
    salaryMax: 130000,
    requiredSkills: '',
    niceToHaveSkills: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/jobs', formData);
      if (res.data.success) {
        addToast('Job Created!', 'Position is now open for candidate matching.', 'success');
        navigate('/recruiter/my-jobs');
      }
    } catch (err) {
      addToast('Creation Error', err.response?.data?.message || 'Failed to post job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Job Position</h1>
        <p className="text-xs text-slate-500 mt-1">Define required candidate competencies for transparent CareerMatch scoring.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Full Stack Engineer (React / Node.js)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Engineering, Design, Product..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="San Francisco, CA or Remote"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
            >
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Lead / Executive">Lead / Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Salary ($/yr)</label>
            <input
              type="number"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Salary ($/yr)</label>
            <input
              type="number"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Required Technical Skills (Comma Separated - Essential for Algorithm Match Score)
          </label>
          <input
            type="text"
            name="requiredSkills"
            required
            value={formData.requiredSkills}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB, Git"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nice to Have Skills (Optional - Comma Separated)
          </label>
          <input
            type="text"
            name="niceToHaveSkills"
            value={formData.niceToHaveSkills}
            onChange={handleChange}
            placeholder="TypeScript, Docker, Tailwind CSS"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description & Responsibilities</label>
          <textarea
            rows={6}
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Outline daily duties, engineering stack, and team expectations..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> {submitting ? 'Posting Position...' : 'Publish Job Position'}
        </button>
      </form>
    </div>
  );
};

export default CreateJobPage;
