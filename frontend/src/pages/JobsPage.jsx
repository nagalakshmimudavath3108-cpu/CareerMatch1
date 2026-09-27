import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MatchScoreGauge from '../components/MatchScoreGauge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, MapPin, Briefcase, Filter, X, Sparkles, Building } from 'lucide-react';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (location) queryParams.append('location', location);
      if (type) queryParams.append('type', type);
      if (experienceLevel) queryParams.append('experienceLevel', experienceLevel);

      const res = await api.get(`/jobs?${queryParams.toString()}`);
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  // Real-Time Socket Event Listeners for Live Job Listings & Skill Match Updates
  useEffect(() => {
    if (!socket) return;

    const handleJobChange = () => {
      fetchJobs();
    };

    socket.on('job_created', handleJobChange);
    socket.on('job_updated', handleJobChange);
    socket.on('job_deleted', handleJobChange);
    socket.on('profile_updated', handleJobChange);

    return () => {
      socket.off('job_created', handleJobChange);
      socket.off('job_updated', handleJobChange);
      socket.off('job_deleted', handleJobChange);
      socket.off('profile_updated', handleJobChange);
    };
  }, [socket, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (keyword) params.keyword = keyword;
    if (location) params.location = location;
    if (type) params.type = type;
    if (experienceLevel) params.experienceLevel = experienceLevel;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setType('');
    setExperienceLevel('');
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explore Open Positions</h1>
        <p className="text-xs text-slate-500 mt-1">
          {user && user.role === 'jobseeker'
            ? 'CareerMatch automatically calculates your personalized match score for every position.'
            : 'Find your next high-impact career move.'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by job title, skill, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Location (e.g. Remote, NY)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filter Jobs
          </button>
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setSearchParams({ keyword, location, type: e.target.value, experienceLevel });
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>

          <select
            value={experienceLevel}
            onChange={(e) => {
              setExperienceLevel(e.target.value);
              setSearchParams({ keyword, location, type, experienceLevel: e.target.value });
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
          >
            <option value="">All Experience Levels</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior Level">Senior Level</option>
            <option value="Lead / Executive">Lead / Executive</option>
          </select>

          {(keyword || location || type || experienceLevel) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 font-semibold hover:text-rose-700 flex items-center gap-1 ml-auto"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingSpinner text="Searching jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No Matching Jobs Found"
          description="Try broadening your search query or removing filters."
          action={
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              Reset All Filters
            </button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-brand-300 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-snug">
                      <Link to={`/jobs/${job._id}`} className="hover:text-brand-600 transition-colors">
                        {job.title}
                      </Link>
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" /> {job.companyName}
                    </p>
                  </div>

                  {job.matchPercentage !== undefined && (
                    <MatchScoreGauge matchPercentage={job.matchPercentage} compact />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-slate-600">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100">{job.location}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 capitalize">{job.type}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100">{job.experienceLevel}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4">{job.description}</p>

                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill, idx) => {
                      const isMatched = job.matchingSkills?.includes(skill);
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-900">
                  ${job.salaryMin ? job.salaryMin.toLocaleString() : '0'} - ${job.salaryMax ? job.salaryMax.toLocaleString() : '0'} / yr
                </span>
                <Link
                  to={`/jobs/${job._id}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  View Details & Apply
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
