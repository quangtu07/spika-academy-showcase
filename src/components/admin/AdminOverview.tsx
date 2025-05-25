
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OverviewStats {
  totalUsers: number;
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Fetch users data
      const { data: users } = await supabase
        .from('profiles')
        .select('role');

      // Fetch courses data
      const { data: courses } = await supabase
        .from('courses')
        .select('price');

      if (users) {
        const totalUsers = users.length;
        const totalStudents = users.filter(u => u.role === 'student').length;
        const totalTeachers = users.filter(u => u.role === 'teacher').length;
        
        let totalRevenue = 0;
        if (courses) {
          totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0), 0);
        }

        setStats({
          totalUsers,
          totalCourses: courses?.length || 0,
          totalStudents,
          totalTeachers,
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả tài khoản trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học viên</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Số lượng học viên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giáo viên</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Số lượng giáo viên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số khóa học
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Thống kê tài chính</span>
          </CardTitle>
          <CardDescription>
            Tổng giá trị các khóa học trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Tổng giá trị tất cả khóa học hiện có
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
