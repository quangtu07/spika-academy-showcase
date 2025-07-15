import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics-tracker';

const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view khi route thay đổi
    const trackCurrentPage = async () => {
      try {
        await trackPageView(location.pathname);
      } catch (error) {
        // Không log error để tránh spam console trong production
        if (process.env.NODE_ENV === 'development') {
          console.error('Analytics tracking error:', error);
        }
      }
    };

    // Delay một chút để đảm bảo page đã load xong
    const timeoutId = setTimeout(trackCurrentPage, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // Component này không render gì cả
  return null;
};

export default AnalyticsTracker;