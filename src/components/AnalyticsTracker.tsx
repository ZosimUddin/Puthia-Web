import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView } from '../api';
import { auth } from '../firebase';

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Log page view on route change
    const path = location.pathname;
    const userId = auth.currentUser?.uid;
    logPageView(path, userId);
  }, [location]);

  return null;
};
