import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AllToolsCalculators } from '../../components/AllToolsCalculators';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';

const ToolsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1">
        <AllToolsCalculators onGoBack={() => navigate(-1)} />
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default ToolsPage;

