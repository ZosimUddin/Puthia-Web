import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const EditProfile: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ name });
    alert('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
    navigate('/admin/profile');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-emerald-950 mb-6">প্রোফাইল এডিট করুন</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">নাম</label>
          <input 
            type="text" 
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl"
          />
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700">
          সংরক্ষণ করুন
        </button>
      </form>
    </div>
  );
};
