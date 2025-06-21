
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
      // Fetch users data
      const { data: users } = await supabase
        .from('profiles')
        .select('role');

      // Fetch courses data
      const { data: courses } = await supabase
        .from('courses')
        .select('id');

      // Fetch classes data
      const { data: classes } = await supabase
        .from('classes')
        .select('id');

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
      description: 'Tất cả tài khoản trong hệ thống',
      gradient: 'from-[#02458b] to-[#1294fb]',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-[#02458b]'
    },
    {
      title: 'Quản trị viên',
      value: stats.totalAdmins,
      icon: Shield,
      description: 'Số lượng quản trị viên',
      gradient: 'from-[#02458b] to-[#1294fb]',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-[#02458b]'
    },
    {
      title: 'Học viên',
      value: stats.totalStudents,
      icon: UserCheck,
      description: 'Số lượng học viên',
      gradient: 'from-[#02458b] to-[#1294fb]',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-[#02458b]'
    },
    {
      title: 'Giáo viên',
      value: stats.totalTeachers,
      icon: GraduationCap,
      description: 'Số lượng giáo viên',
      gradient: 'from-[#02458b] to-[#1294fb]',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-[#02458b]'
    },
    {
      title: 'Khóa học',
      value: stats.totalCourses,
      icon: BookOpen,
      description: 'Tổng số khóa học',
      gradient: 'from-[#02458b] to-[#1294fb]',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-[#02458b]'
    },
    {
      title: 'Lớp học',
      value: stats.totalClasses,
      icon: TrendingUp,
      description: 'Tổng số lớp học',
      gradient: 'from-[#02458b] to-[#1294fb]',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-[#02458b]'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-lg">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-[#02458b]">
          Tổng quan hệ thống
        </h2>
        <p className="text-gray-600 text-lg">
          Thống kê tổng quan về tất cả hoạt động trong hệ thống quản lý học tập
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, index) => (
          <Card 
            key={card.title} 
            className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${card.bgGradient} hover:scale-105 transform`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <CardHeader className="relative space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  {card.title}
                </CardTitle>
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-4xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#02458b] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            Hệ thống đang hoạt động tốt
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tất cả các chức năng trong hệ thống đang vận hành ổn định. 
            Bạn có thể quản lý người dùng, khóa học và lớp học một cách hiệu quả.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
