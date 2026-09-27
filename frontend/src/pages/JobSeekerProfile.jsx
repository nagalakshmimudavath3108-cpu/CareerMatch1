import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Briefcase, GraduationCap, Code, FileText, Upload, Plus, Trash2, Save, Sparkles } from 'lucide-react';

export const JobSeekerProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { addToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    headline: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    github: '',
    linkedin: '',
    experienceYears: 0,
    skills: '',
    education: [],
    experience: [],
    projects: [],
  });

  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: user?.name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        experienceYears: profile.experienceYears || 0,
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        education: profile.education || [],
        experience: profile.experience || [],
        projects: profile.projects || [],
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Education Helpers
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }],
    });
  };

  const updateEducation = (idx, field, value) => {
    const updated = [...formData.education];
    updated[idx][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (idx) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== idx) });
  };

  // Experience Helpers
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' }],
    });
  };

  const updateExperience = (idx, field, value) => {
    const updated = [...formData.experience];
    updated[idx][field] = value;
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (idx) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== idx) });
  };

  // Project Helpers
  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { title: '', description: '', technologies: [], githubLink: '', liveLink: '' }],
    });
  };

  const updateProject = (idx, field, value) => {
    const updated = [...formData.projects];
    updated[idx][field] = value;
    setFormData({ ...formData, projects: updated });
  };

  const removeProject = (idx) => {
    setFormData({ ...formData, projects: formData.projects.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('headline', formData.headline);
      data.append('bio', formData.bio);
      data.append('location', formData.location);
      data.append('phone', formData.phone);
      data.append('website', formData.website);
      data.append('github', formData.github);
      data.append('linkedin', formData.linkedin);
      data.append('experienceYears', formData.experienceYears);
      data.append('skills', formData.skills);
      data.append('education', JSON.stringify(formData.education));
      data.append('experience', JSON.stringify(formData.experience));
      data.append('projects', JSON.stringify(formData.projects));

      if (resumeFile) {
        data.append('resume', resumeFile);
      }

      const res = await api.put('/profiles/jobseeker', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Profile Updated!', 'Your skills and experience have been saved.', 'success');
        refreshProfile();
      }
    } catch (err) {
      addToast('Error Updating Profile', err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Candidate Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your skills and resume up-to-date to maximize your CareerMatch score on job postings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" /> Basic Details & Headline
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Senior Full-Stack Engineer | React & Node.js Specialist"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Austin, TX or Remote"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary / Bio</label>
            <textarea
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell hiring managers about your expertise and software achievements..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> Verified Technical Skills
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skills List (Comma Separated - Used for Real-Time Matching)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, JavaScript, Express, Git, Tailwind CSS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.skills.split(',').filter(Boolean).map((s, idx) => (
              <span key={idx} className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600" /> Work Experience
            </h3>
            <button
              type="button"
              onClick={addExperience}
              className="px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>

          {formData.experience.map((exp, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeExperience(idx)}
                className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Role Title"
                  value={exp.role}
                  onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Start Date (e.g. 2022)"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="End Date (or Present)"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Description of accomplishments..."
                value={exp.description}
                onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-600" /> Education & Qualifications
            </h3>
            <button
              type="button"
              onClick={addEducation}
              className="px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>

          {formData.education.map((edu, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Institution Name"
                  value={edu.institution}
                  onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Degree (e.g. B.S. Computer Science)"
                  value={edu.degree}
                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="Start Year"
                  value={edu.startYear}
                  onChange={(e) => updateEducation(idx, 'startYear', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="End Year"
                  value={edu.endYear}
                  onChange={(e) => updateEducation(idx, 'endYear', e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Resume Upload */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" /> Upload Resume / CV Document
          </h3>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-400 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Upload PDF, DOC, or DOCX resume file</p>
            <p className="text-[10px] text-slate-400 mt-1">Maximum file size 10MB</p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="mt-3 text-xs text-slate-500 mx-auto"
            />

            {profile?.resumeUrl && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-brand-600">
                Uploaded Resume: {profile.resumeOriginalName || 'resume.pdf'}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export default JobSeekerProfile;
