import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import MatchScoreGauge from '../components/MatchScoreGauge';
import { Briefcase, Sparkles, Zap, Shield, Search, ArrowRight, Building, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/jobs?limit=4');
        if (res.data.success) {
          setFeaturedJobs(res.data.jobs.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 text-white p-8 sm:p-14 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            <span>Real-Time Skill Matching Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Connect Talent with Opportunity in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-300">Real-Time</span>.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed font-normal">
            CareerMatch replaces guesswork with transparent skill matching algorithms, instant recruiter notifications, live chat, and automated interview scheduling.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title, skill (e.g. React, Node.js), or company..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none w-full"
              />
            </div>
            <Link
              to={`/jobs?keyword=${encodeURIComponent(searchKeyword)}`}
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-600/30"
            >
              Explore Opportunities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
              <p className="text-xs text-slate-400 mt-0.5">Transparent Skill Match</p>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">Instant</span>
              <p className="text-xs text-slate-400 mt-0.5">Socket.IO Notifications</p>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">Direct</span>
              <p className="text-xs text-slate-400 mt-0.5">Recruiter Live Chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* CareerMatch Algorithm Demo Explanation */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" /> Explainable Matching Logic
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How the CareerMatch Algorithm Works
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            No black-box AI or hidden biases. Our matching system evaluates your verified candidate skills against a job's exact requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider mb-2">
                Sample Job Requirements
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-lg text-xs font-semibold">React</span>
                <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-lg text-xs font-semibold">Node.js</span>
                <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-lg text-xs font-semibold">MongoDB</span>
                <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-lg text-xs font-semibold">Git</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider mb-2">
                Candidate Profile Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">React</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">Node.js</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">MongoDB</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200">
              <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                <span>Calculation Formula:</span>
                <span>(3 Matched / 4 Required) × 100</span>
              </div>
            </div>
          </div>

          <div>
            <MatchScoreGauge
              matchPercentage={75}
              matchingSkills={['React', 'Node.js', 'MongoDB']}
              missingSkills={['Git']}
            />
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Opportunities</h2>
            <p className="text-xs text-slate-500 mt-1">Explore verified positions from hiring teams</p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {featuredJobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-brand-300 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{job.companyName}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    {job.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requiredSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <span>{job.location}</span>
                <span className="text-brand-600 font-bold">
                  ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / yr
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Role CTA Cards */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <Users className="w-10 h-10 mb-4 text-brand-200" />
            <h3 className="text-2xl font-bold mb-2">For Job Seekers & Students</h3>
            <p className="text-slate-200 text-sm mb-6">
              Create your profile, see your exact skill match score on every job posting, and receive instant interview invites.
            </p>
            <Link
              to="/register?role=jobseeker"
              className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-slate-100 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              Build Seeker Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <Building className="w-10 h-10 mb-4 text-indigo-400" />
            <h3 className="text-2xl font-bold mb-2">For Recruiters & Companies</h3>
            <p className="text-slate-300 text-sm mb-6">
              Post job openings, view pre-ranked candidate profiles, shortlist candidates, and start real-time chat.
            </p>
            <Link
              to="/register?role=recruiter"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              Post a Position <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
