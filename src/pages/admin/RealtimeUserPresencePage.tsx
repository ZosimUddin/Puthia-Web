import React from 'react';
import { RealtimeUserPresenceMonitor } from '../../components/admin/RealtimeUserPresenceMonitor';
import SEO from '../../components/SEO';

export const RealtimeUserPresencePage: React.FC = () => {
  return (
    <>
      <SEO 
        title="রিয়েল-টাইম ইউজার মনিটরিং | আমাদের পুঠিয়া" 
        description="পুঠিয়া স্মার্ট সিটি পোর্টালে বর্তমানে সক্রিয় সকল অনলাইন নাগরিক ও ভিজিটরদের লাইভ ট্র্যাকিং এবং অ্যাডমিন কমান্ড সেন্টার।" 
      />
      <RealtimeUserPresenceMonitor />
    </>
  );
};

export default RealtimeUserPresencePage;
