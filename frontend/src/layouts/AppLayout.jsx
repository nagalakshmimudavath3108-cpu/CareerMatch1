import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ToastContainer from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';

export const AppLayout = ({ withSidebar = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <ToastContainer />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {user && withSidebar && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
