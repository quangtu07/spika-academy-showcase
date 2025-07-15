import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, TrendingUp, Users, Eye, BarChart3, AlertCircle, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AnalyticsData {
  id: string;
  date: string;
  visit_count: number;
  unique_visitors: number;
  page_views: number;
  created_at: string;
  updated_at: string;
}

interface ChartData {
  date: string;
  displayDate: string;
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
}

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // 7, 14, 30 days
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!roleLoading && userRole === 'admin') {
      fetchAnalyticsData();
    }
  }, [dateRange, userRole, roleLoading]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const daysBack = parseInt(dateRange);
      const startDate = format(subDays(new Date(), daysBack - 1), 'yyyy-MM-dd');
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

      setAnalyticsData(data || []);

      // Transform data for chart
      const transformedData: ChartData[] = (data || []).map(item => ({
        date: item.date,
        displayDate: format(new Date(item.date), 'dd/MM', { locale: vi }),
        visits: item.visit_count,
        uniqueVisitors: item.unique_visitors,
        pageViews: item.page_views
      }));

      setChartData(transformedData);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      const errorMessage = error?.message || "Không thể tải dữ liệu thống kê. Vui lòng thử lại.";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    if (!analyticsData.length) return { totalVisits: 0, totalUniqueVisitors: 0, totalPageViews: 0, avgVisitsPerDay: 0 };

    const totalVisits = analyticsData.reduce((sum, item) => sum + item.visit_count, 0);
    const totalUniqueVisitors = analyticsData.reduce((sum, item) => sum + item.unique_visitors, 0);
    const totalPageViews = analyticsData.reduce((sum, item) => sum + item.page_views, 0);
    const avgVisitsPerDay = Math.round(totalVisits / analyticsData.length);

    return { totalVisits, totalUniqueVisitors, totalPageViews, avgVisitsPerDay };
  };

  const stats = getTotalStats();

  // Kiểm tra phân quyền
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!userRole || userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Truy cập bị từ chối</h3>
          <p className="text-gray-600">Chỉ quản trị viên mới có thể xem thống kê truy cập.</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Thống kê truy cập</h2>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchAnalyticsData} variant="outline">
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{`Ngày: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="text-center lg:text-left">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto lg:mx-0 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto lg:mx-0 mt-2 animate-pulse"></div>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="h-10 bg-gray-200 rounded w-full sm:w-40 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full sm:w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Loading Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Chart */}
        <Card className="animate-pulse border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mt-2"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="w-3 h-3 bg-gray-200 rounded-full ml-4"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="h-60 sm:h-80 lg:h-96 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#02458b]">Thống kê truy cập</h2>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Theo dõi lượt truy cập website theo thời gian</p>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 lg:flex-row">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Chọn khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="14">14 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchAnalyticsData} variant="outline" size="sm" className="w-full sm:w-auto">
            <BarChart3 className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105 transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-gray-700">Tổng lượt truy cập</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">
              Trung bình {stats.avgVisitsPerDay.toLocaleString()}/ngày
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105 transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-gray-700">Người dùng duy nhất</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl lg:text-3xl font-bold text-green-600">{stats.totalUniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">
              {analyticsData.length > 0 ? Math.round(stats.totalUniqueVisitors / analyticsData.length).toLocaleString() : 0}/ngày
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 hover:scale-105 transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-gray-700">Lượt xem trang</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shadow-md">
              <Eye className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl lg:text-3xl font-bold text-red-600">{stats.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">
              {analyticsData.length > 0 ? Math.round(stats.totalPageViews / analyticsData.length).toLocaleString() : 0}/ngày
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105 transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-gray-700">Tỷ lệ trang/phiên</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center shadow-md">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl lg:text-3xl font-bold text-orange-600">
              {stats.totalVisits > 0 ? (stats.totalPageViews / stats.totalVisits).toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Trang/lượt truy cập
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-lg lg:text-xl font-bold text-[#02458b]">Biểu đồ lượt truy cập</CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Thống kê lượt truy cập website trong {dateRange} ngày qua
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Lượt truy cập</span>
              <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
              <span className="text-xs text-gray-600">Người dùng</span>
              <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
              <span className="text-xs text-gray-600">Lượt xem</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          {chartData.length > 0 ? (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 400}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 10 : 20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#2563eb"
                    strokeWidth={isMobile ? 2 : 3}
                    name="Lượt truy cập"
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                    activeDot={{ r: isMobile ? 5 : 6, stroke: '#2563eb', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uniqueVisitors"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Người dùng duy nhất"
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: isMobile ? 2 : 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="#dc2626"
                    strokeWidth={2}
                    name="Lượt xem trang"
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: isMobile ? 2 : 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 sm:h-80 text-gray-500">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-600">Không có dữ liệu thống kê</p>
                  <p className="text-sm text-gray-500 mt-1">Dữ liệu sẽ được cập nhật tự động</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;