import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Save, ArrowLeft } from 'lucide-react';

export const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    experienceLevel: 'Mid Level',
    salaryMin: 0,
    salaryMax: 0,
    requiredSkills: '',
    niceToHaveSkills: '',
    description: '',
    status: 'open',
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          const j = res.data.job;
          setFormData({
            title: j.title || '',
            department: j.department || 'Engineering',
            location: j.location || '',
            type: j.type || 'full-time',
            experienceLevel: j.experienceLevel || 'Mid Level',
            salaryMin: j.salaryMin || 0,
            salaryMax: j.salaryMax || 0,
            requiredSkills: Array.isArray(j.requiredSkills) ? j.requiredSkills.join(', ') : '',
            niceToHaveSkills: Array.isArray(j.niceToHaveSkills) ? j.niceToHaveSkills.join(', ') : '',
            description: j.description || '',
            status: j.status || 'open',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.put(`/jobs/${id}`, formData);
      if (res.data.success) {
        addToast('Job Updated', 'Position details saved successfully.', 'success');
        navigate('/recruiter/my-jobs');
      }
    } catch (err) {
      addToast('Update Error', err.response?.data?.message || 'Failed to update job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching job details..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Position</h1>
        <p className="text-xs text-slate-500 mt-1">Update job parameters and required skill tags.</p>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-bold"
            >
              <option value="open">OPEN (Accepting Applications)</option>
              <option value="closed">CLOSED (Archived)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
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
            Required Technical Skills (Comma Separated)
          </label>
          <input
            type="text"
            name="requiredSkills"
            required
            value={formData.requiredSkills}
            onChange={handleChange}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
          <textarea
            rows={6}
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Job Updates'}
        </button>
      </form>
    </div>
  );
};

export default EditJobPage;
