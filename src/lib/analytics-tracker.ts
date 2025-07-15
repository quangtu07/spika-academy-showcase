import { incrementTodayVisits } from './analytics-api';
import { format } from 'date-fns';

// Key để lưu trong localStorage
const VISIT_TRACKING_KEY = 'fwa_visit_tracking';
const UNIQUE_VISITOR_KEY = 'fwa_unique_visitor';
const SESSION_KEY = 'fwa_session_id';

interface VisitTrackingData {
  lastVisitDate: string;
  sessionId: string;
  pageViews: number;
  isUniqueVisitor: boolean;
}

/**
 * Tạo session ID duy nhất
 */
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Lấy hoặc tạo session ID
 */
const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Kiểm tra xem có phải là unique visitor không
 */
const isUniqueVisitor = (): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const uniqueVisitorData = localStorage.getItem(UNIQUE_VISITOR_KEY);
  
  if (!uniqueVisitorData) {
    // Chưa từng truy cập
    localStorage.setItem(UNIQUE_VISITOR_KEY, JSON.stringify({
      firstVisitDate: today,
      lastVisitDate: today
    }));
    return true;
  }

  try {
    const data = JSON.parse(uniqueVisitorData);
    if (data.lastVisitDate !== today) {
      // Truy cập trong ngày mới
      data.lastVisitDate = today;
      localStorage.setItem(UNIQUE_VISITOR_KEY, JSON.stringify(data));
      return true;
    }
    return false; // Đã truy cập trong ngày hôm nay
  } catch (error) {
    console.error('Error parsing unique visitor data:', error);
    return true;
  }
};

/**
 * Lấy dữ liệu tracking từ localStorage
 */
const getTrackingData = (): VisitTrackingData | null => {
  try {
    const data = localStorage.getItem(VISIT_TRACKING_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error parsing tracking data:', error);
    return null;
  }
};

/**
 * Lưu dữ liệu tracking vào localStorage
 */
const saveTrackingData = (data: VisitTrackingData): void => {
  try {
    localStorage.setItem(VISIT_TRACKING_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving tracking data:', error);
  }
};

/**
 * Track một lượt truy cập trang
 */
export const trackPageView = async (pagePath?: string): Promise<void> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const sessionId = getOrCreateSessionId();
    const isUnique = isUniqueVisitor();
    
    let trackingData = getTrackingData();
    let isNewVisit = false;
    let isNewSession = false;

    if (!trackingData) {
      // Lần đầu tiên truy cập
      trackingData = {
        lastVisitDate: today,
        sessionId,
        pageViews: 1,
        isUniqueVisitor: isUnique
      };
      isNewVisit = true;
      isNewSession = true;
    } else {
      // Kiểm tra xem có phải session mới không
      if (trackingData.sessionId !== sessionId) {
        isNewSession = true;
        trackingData.sessionId = sessionId;
      }

      // Kiểm tra xem có phải ngày mới không
      if (trackingData.lastVisitDate !== today) {
        isNewVisit = true;
        trackingData.lastVisitDate = today;
        trackingData.pageViews = 1;
        trackingData.isUniqueVisitor = isUnique;
      } else {
        // Cùng ngày, tăng page views
        trackingData.pageViews += 1;
      }
    }

    // Lưu dữ liệu tracking
    saveTrackingData(trackingData);

    // Gửi dữ liệu lên server (chỉ khi cần thiết để tránh spam)
    const shouldUpdateServer = isNewVisit || isNewSession || trackingData.pageViews % 5 === 0; // Cập nhật mỗi 5 page views
    
    if (shouldUpdateServer) {
      await incrementTodayVisits(
        isNewVisit ? 1 : 0, // Chỉ tăng visit count khi là visit mới
        isUnique ? 1 : 0,   // Chỉ tăng unique visitor khi là unique
        1                   // Luôn tăng page views
      );
    }

    // Log để debug (chỉ trong development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics tracking:', {
        pagePath,
        today,
        sessionId,
        isNewVisit,
        isNewSession,
        isUnique,
        pageViews: trackingData.pageViews,
        shouldUpdateServer
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
    // Không throw error để không ảnh hưởng đến UX
  }
};

/**
 * Track khi user rời khỏi trang (để cập nhật page views cuối cùng)
 */
export const trackPageLeave = async (): Promise<void> => {
  try {
    const trackingData = getTrackingData();
    if (trackingData && trackingData.pageViews > 0) {
      // Cập nhật page views cuối cùng lên server
      await incrementTodayVisits(0, 0, 0); // Chỉ để đảm bảo dữ liệu được sync
    }
  } catch (error) {
    console.error('Error tracking page leave:', error);
  }
};

/**
 * Reset tracking data (dùng cho testing hoặc khi cần reset)
 */
export const resetTrackingData = (): void => {
  try {
    localStorage.removeItem(VISIT_TRACKING_KEY);
    localStorage.removeItem(UNIQUE_VISITOR_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error resetting tracking data:', error);
  }
};

/**
 * Lấy thông tin tracking hiện tại (dùng cho debug)
 */
export const getTrackingInfo = (): {
  trackingData: VisitTrackingData | null;
  sessionId: string;
  isUniqueToday: boolean;
} => {
  return {
    trackingData: getTrackingData(),
    sessionId: getOrCreateSessionId(),
    isUniqueToday: isUniqueVisitor()
  };
};

/**
 * Hook để tự động track page views khi component mount
 */
export const useAnalyticsTracking = (pagePath?: string) => {
  const trackCurrentPage = () => {
    trackPageView(pagePath || window.location.pathname);
  };

  // Track khi component mount
  React.useEffect(() => {
    trackCurrentPage();

    // Track khi user rời khỏi trang
    const handleBeforeUnload = () => {
      trackPageLeave();
    };

    // Track khi tab bị ẩn (user chuyển tab khác)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackPageLeave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pagePath]);

  return {
    trackPageView: trackCurrentPage,
    getTrackingInfo,
    resetTrackingData
  };
};

// Import React để sử dụng trong hook
import React from 'react';