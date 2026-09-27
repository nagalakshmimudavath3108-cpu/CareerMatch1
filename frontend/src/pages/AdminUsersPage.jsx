import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Trash2, Shield, Search, Circle } from 'lucide-react';

export const AdminUsersPage = () => {
  const { addToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState('');
  const [keyword, setKeyword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (roleFilter) queryParams.append('role', roleFilter);
      if (keyword) queryParams.append('keyword', keyword);

      const res = await api.get(`/admin/users?${queryParams.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, keyword]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        addToast('User Deleted', 'Account removed from system', 'info');
        fetchUsers();
      }
    } catch (err) {
      addToast('Delete Error', err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Fetching platform users..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-xs text-slate-500 mt-1">View, filter, and moderate registered accounts.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-slate-700"
        >
          <option value="">All Roles</option>
          <option value="jobseeker">Job Seekers</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{u.name}</h4>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <Circle className={`w-2.5 h-2.5 fill-current ${u.isOnline ? 'text-emerald-500' : 'text-slate-300'}`} />
                      {u.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
