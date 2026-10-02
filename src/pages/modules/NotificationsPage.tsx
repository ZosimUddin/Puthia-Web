import React from 'react';
import Notifications from '../../components/user/Notifications';
import SEO from '../../components/SEO';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-6">
      <SEO 
        title="Notifications - আড্ডা" 
        description="আপনার সকল সাম্প্রতিক ও পূর্ববর্তী নোটিফিকেশন" 
      />

      {/* Main Notifications Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto bg-white">
        <Notifications />
      </main>
    </div>
  );
};

export default NotificationsPage;
