
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, UserCheck, Shield, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OverviewStats {
  totalUsers: number;
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalClasses: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalClasses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const { data: users } = await supabase.from('profiles').select('role');
      const { data: courses } = await supabase.from('courses').select('id');
      const { data: classes } = await supabase.from('classes').select('id');

      if (users) {
        const totalUsers = users.length;
        const totalStudents = users.filter(u => u.role === 'student').length;
        const totalTeachers = users.filter(u => u.role === 'teacher').length;
        const totalAdmins = users.filter(u => u.role === 'admin').length;

        setStats({
          totalUsers,
          totalCourses: courses?.length || 0,
          totalStudents,
          totalTeachers,
          totalAdmins,
          totalClasses: classes?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Quản trị viên',
      value: stats.totalAdmins,
      icon: Shield,
      color: 'from-red-500 to-pink-600'
    },
    {
      title: 'Học viên',
      value: stats.totalStudents,
      icon: UserCheck,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Giáo viên',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Khóa học',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Lớp học',
      value: stats.totalClasses,
      icon: TrendingUp,
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
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
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
        <p className="text-gray-600 mt-2">Thống kê tổng quan về hoạt động trong hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
