import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface AnalyticsData {
  id: string;
  date: string;
  visit_count: number;
  unique_visitors: number;
  page_views: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsStats {
  totalVisits: number;
  totalUniqueVisitors: number;
  totalPageViews: number;
  avgVisitsPerDay: number;
  avgUniqueVisitorsPerDay: number;
  avgPageViewsPerDay: number;
  pagesPerVisit: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Lấy dữ liệu thống kê theo khoảng thời gian
 */
export const getAnalyticsData = async (days: number = 7): Promise<AnalyticsData[]> => {
  try {
    const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('website_analytics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

/**
 * Lấy dữ liệu thống kê theo khoảng thời gian tùy chỉnh
 */
export const getAnalyticsDataByDateRange = async (dateRange: DateRange): Promise<AnalyticsData[]> => {
  try {
    const { data, error } = await supabase
      .from('website_analytics')
      .select('*')
      .gte('date', dateRange.startDate)
      .lte('date', dateRange.endDate)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching analytics data by date range:', error);
    throw error;
  }
};

/**
 * Tính toán thống kê tổng hợp từ dữ liệu
 */
export const calculateAnalyticsStats = (data: AnalyticsData[]): AnalyticsStats => {
  if (!data.length) {
    return {
      totalVisits: 0,
      totalUniqueVisitors: 0,
      totalPageViews: 0,
      avgVisitsPerDay: 0,
      avgUniqueVisitorsPerDay: 0,
      avgPageViewsPerDay: 0,
      pagesPerVisit: 0
    };
  }

  const totalVisits = data.reduce((sum, item) => sum + item.visit_count, 0);
  const totalUniqueVisitors = data.reduce((sum, item) => sum + item.unique_visitors, 0);
  const totalPageViews = data.reduce((sum, item) => sum + item.page_views, 0);
  
  const days = data.length;
  const avgVisitsPerDay = Math.round(totalVisits / days);
  const avgUniqueVisitorsPerDay = Math.round(totalUniqueVisitors / days);
  const avgPageViewsPerDay = Math.round(totalPageViews / days);
  const pagesPerVisit = totalVisits > 0 ? Number((totalPageViews / totalVisits).toFixed(1)) : 0;

  return {
    totalVisits,
    totalUniqueVisitors,
    totalPageViews,
    avgVisitsPerDay,
    avgUniqueVisitorsPerDay,
    avgPageViewsPerDay,
    pagesPerVisit
  };
};

/**
 * Lấy thống kê tổng quan (tất cả thời gian)
 */
export const getOverallAnalyticsStats = async (): Promise<AnalyticsStats> => {
  try {
    const { data, error } = await supabase
      .from('website_analytics')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return calculateAnalyticsStats(data || []);
  } catch (error) {
    console.error('Error fetching overall analytics stats:', error);
    throw error;
  }
};

/**
 * Lấy dữ liệu thống kê cho ngày hôm nay
 */
export const getTodayAnalytics = async (): Promise<AnalyticsData | null> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('website_analytics')
      .select('*')
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching today analytics:', error);
    throw error;
  }
};

/**
 * Cập nhật hoặc tạo mới dữ liệu thống kê cho một ngày
 */
export const upsertAnalyticsData = async (
  date: string,
  visitCount: number,
  uniqueVisitors: number,
  pageViews: number
): Promise<AnalyticsData> => {
  try {
    const { data, error } = await supabase
      .from('website_analytics')
      .upsert({
        date,
        visit_count: visitCount,
        unique_visitors: uniqueVisitors,
        page_views: pageViews,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error upserting analytics data:', error);
    throw error;
  }
};

/**
 * Tăng số lượt truy cập cho ngày hôm nay
 */
export const incrementTodayVisits = async (
  incrementVisits: number = 1,
  incrementUniqueVisitors: number = 0,
  incrementPageViews: number = 1
): Promise<void> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayData = await getTodayAnalytics();

    if (todayData) {
      // Cập nhật dữ liệu hiện có
      await upsertAnalyticsData(
        today,
        todayData.visit_count + incrementVisits,
        todayData.unique_visitors + incrementUniqueVisitors,
        todayData.page_views + incrementPageViews
      );
    } else {
      // Tạo mới dữ liệu cho ngày hôm nay
      await upsertAnalyticsData(
        today,
        incrementVisits,
        incrementUniqueVisitors,
        incrementPageViews
      );
    }
  } catch (error) {
    console.error('Error incrementing today visits:', error);
    throw error;
  }
};

/**
 * Lấy top ngày có lượt truy cập cao nhất
 */
export const getTopVisitDays = async (limit: number = 10): Promise<AnalyticsData[]> => {
  try {
    const { data, error } = await supabase
      .from('website_analytics')
      .select('*')
      .order('visit_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching top visit days:', error);
    throw error;
  }
};

/**
 * Lấy xu hướng tăng trưởng (so sánh với kỳ trước)
 */
export const getGrowthTrend = async (days: number = 7): Promise<{
  currentPeriod: AnalyticsStats;
  previousPeriod: AnalyticsStats;
  growthRate: {
    visits: number;
    uniqueVisitors: number;
    pageViews: number;
  };
}> => {
  try {
    // Lấy dữ liệu kỳ hiện tại
    const currentData = await getAnalyticsData(days);
    
    // Lấy dữ liệu kỳ trước
    const previousStartDate = format(subDays(new Date(), days * 2 - 1), 'yyyy-MM-dd');
    const previousEndDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    
    const previousData = await getAnalyticsDataByDateRange({
      startDate: previousStartDate,
      endDate: previousEndDate
    });

    const currentStats = calculateAnalyticsStats(currentData);
    const previousStats = calculateAnalyticsStats(previousData);

    // Tính tỷ lệ tăng trưởng
    const calculateGrowthRate = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number(((current - previous) / previous * 100).toFixed(1));
    };

    const growthRate = {
      visits: calculateGrowthRate(currentStats.totalVisits, previousStats.totalVisits),
      uniqueVisitors: calculateGrowthRate(currentStats.totalUniqueVisitors, previousStats.totalUniqueVisitors),
      pageViews: calculateGrowthRate(currentStats.totalPageViews, previousStats.totalPageViews)
    };

    return {
      currentPeriod: currentStats,
      previousPeriod: previousStats,
      growthRate
    };
  } catch (error) {
    console.error('Error calculating growth trend:', error);
    throw error;
  }
};