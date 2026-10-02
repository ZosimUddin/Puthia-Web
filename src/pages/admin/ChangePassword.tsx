import React, { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (auth.currentUser) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        await updatePassword(auth.currentUser, newPassword);
        setSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
        setTimeout(() => {
          navigate('/admin/profile');
        }, 1500);
      } catch (err: any) {
        console.error('Password change error:', err);
        setError(getFriendlyAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else {
      setError('লগইন করা ইউজার পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-emerald-950 mb-6">পাসওয়ার্ড পরিবর্তন</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-bold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 text-sm font-bold">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">নতুন পাসওয়ার্ড</label>
          <input 
            type="password" 
            value={newPassword || ""}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="কমপক্ষে ৬ অক্ষর..."
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <span>পরিবর্তন করুন</span>}
        </button>
      </form>
    </div>
  );
};
