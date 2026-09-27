import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoutes';
import AppLayout from './layouts/AppLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';

// Job Seeker Pages
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import JobSeekerProfile from './pages/JobSeekerProfile';
import ApplicationsPage from './pages/ApplicationsPage';
import InterviewsPage from './pages/InterviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/RecruiterDashboard';
import CompanyProfilePage from './pages/CompanyProfilePage';
import MyJobsPage from './pages/MyJobsPage';
import CreateJobPage from './pages/CreateJobPage';
import EditJobPage from './pages/EditJobPage';
import ApplicantsPage from './pages/ApplicantsPage';
import CandidateDetailsPage from './pages/CandidateDetailsPage';
import RecruiterAnalyticsPage from './pages/RecruiterAnalyticsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRecruitersPage from './pages/AdminRecruitersPage';
import AdminJobsPage from './pages/AdminJobsPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

// Messages
import MessagesPage from './pages/MessagesPage';

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes with AppLayout */}
              <Route element={<AppLayout withSidebar={false} />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
              </Route>

              {/* Protected Job Seeker Routes */}
              <Route element={<ProtectedRoute allowedRoles={['jobseeker']} />}>
                <Route element={<AppLayout withSidebar={true} />}>
                  <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard />} />
                  <Route path="/jobseeker/profile" element={<JobSeekerProfile />} />
                  <Route path="/jobseeker/applications" element={<ApplicationsPage />} />
                  <Route path="/jobseeker/interviews" element={<InterviewsPage />} />
                  <Route path="/jobseeker/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Protected Recruiter Routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                <Route element={<AppLayout withSidebar={true} />}>
                  <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                  <Route path="/recruiter/company" element={<CompanyProfilePage />} />
                  <Route path="/recruiter/my-jobs" element={<MyJobsPage />} />
                  <Route path="/recruiter/create-job" element={<CreateJobPage />} />
                  <Route path="/recruiter/edit-job/:id" element={<EditJobPage />} />
                  <Route path="/recruiter/applicants" element={<ApplicantsPage />} />
                  <Route path="/recruiter/candidate/:id" element={<CandidateDetailsPage />} />
                  <Route path="/recruiter/interviews" element={<InterviewsPage />} />
                  <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
                </Route>
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AppLayout withSidebar={true} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/recruiters" element={<AdminRecruitersPage />} />
                  <Route path="/admin/jobs" element={<AdminJobsPage />} />
                  <Route path="/admin/applications" element={<AdminApplicationsPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                </Route>
              </Route>

              {/* Shared Protected Routes (Job Seeker / Recruiter / Admin) */}
              <Route element={<ProtectedRoute allowedRoles={['jobseeker', 'recruiter', 'admin']} />}>
                <Route element={<AppLayout withSidebar={true} />}>
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
