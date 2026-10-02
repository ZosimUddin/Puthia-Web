import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { FeedbackReportForm } from './FeedbackReportForm';
import Header from '../home/Header';
import Footer from '../home/Footer';
import BottomNavigation from '../home/BottomNavigation';

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
        <div className="max-w-2xl mx-auto px-4 py-8">
            <button 
                onClick={() => navigate("/profile")}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-600 transition-colors mb-6 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">ড্যাশবোর্ডে ফিরে যান</span>
            </button>
            <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3 mb-8">
                মতামত ও অভিযোগ <MessageSquare size={28} className="text-emerald-500" />
            </h1>
            <FeedbackReportForm onBack={() => navigate('/profile')} />
        </div>
    </div>
  );
};

export default FeedbackPage;
