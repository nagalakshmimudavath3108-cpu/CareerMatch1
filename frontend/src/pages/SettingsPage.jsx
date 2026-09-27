import React, { useState } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { Lock, Shield, Save } from 'lucide-react';

export const SettingsPage = () => {
  const { addToast } = useNotifications();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Password Error', 'New password and confirm password do not match', 'error');
      return;
    }
    setSaving(true);

    try {
      const res = await api.put('/auth/updatepassword', { currentPassword, newPassword });
      if (res.data.success) {
        addToast('Password Updated', 'Your security password has been changed', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast('Update Failed', err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Security Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage credentials and authentication parameters.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-600" /> Change Password
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
