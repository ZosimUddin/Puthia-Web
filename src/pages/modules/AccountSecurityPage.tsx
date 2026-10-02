import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { PrivacySecurityCenter } from '../../components/security/PrivacySecurityCenter';

export const AccountSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <PrivacySecurityCenter onBack={() => navigate(-1)} />
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default AccountSecurityPage;
