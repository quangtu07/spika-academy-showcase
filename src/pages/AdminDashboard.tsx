
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users, BookOpen, BarChart3, AlertCircle, GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import UserManagement from '@/components/admin/UserManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import ClassManagement from '@/components/admin/ClassManagement';
import AdminOverview from '@/components/admin/AdminOverview';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole, isLoading } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    // Kiểm tra quyền truy cập ngay khi component mount hoặc khi role thay đổi
    if (!isLoading) {
      if (!userRole || userRole !== 'admin') {
        toast({
          title: "Truy cập bị từ chối",
          description: "Bạn không có quyền truy cập trang quản lý. Chỉ admin mới có thể truy cập.",
          variant: "destructive",
        });
        // Chuyển hướng về trang chủ sau 2 giây
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    }
  }, [userRole, isLoading, navigate, toast]);

  // Kiểm tra thêm khi user truy cập trực tiếp bằng URL
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      toast({
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để truy cập trang quản lý",
        variant: "destructive",
      });
      navigate('/', { replace: true });
      return;
    }

    const user = JSON.parse(currentUser);
    if (!user.role || user.role !== 'admin') {
      toast({
        title: "Truy cập bị từ chối",
        description: "Tài khoản của bạn không có quyền truy cập trang quản lý",
        variant: "destructive",
      });
      navigate('/', { replace: true });
    }
  }, [navigate, toast]);

  useEffect(() => {
    // Check if we have a state indicating which tab to show
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to avoid persisting it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleGoHome = () => {
    navigate('/');
  };

  // Show access denied if not admin
  if (!isLoading && (!userRole || userRole !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-orange-400/20 to-yellow-400/20 animate-pulse"></div>
        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="relative">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
            </div>
            <CardTitle className="text-red-600 text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Truy cập bị từ chối
            </CardTitle>
            <CardDescription className="text-gray-700">
              Bạn không có quyền truy cập trang quản lý. Chỉ admin mới có thể truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Đang chuyển hướng về trang chủ...
            </p>
            <Button onClick={handleGoHome} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200">
              Về trang chủ ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chỉ render nội dung admin khi đã xác nhận là admin
  if (isLoading || !userRole || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-500 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/70 backdrop-blur-md shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 font-medium">Bảng điều khiển quản trị viên</p>
              </div>
              <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
            </div>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm border-purple-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white transform hover:scale-105 transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-md shadow-lg border-0 p-2 rounded-2xl">
            <TabsTrigger 
              value="overview" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="h-4 w-4" />
              <span className="font-medium">Người dùng</span>
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">Khóa học</span>
            </TabsTrigger>
            <TabsTrigger 
              value="classes" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="font-medium">Lớp học</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-fade-in">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <AdminOverview />
            </div>
          </TabsContent>

          <TabsContent value="users" className="animate-fade-in">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <UserManagement />
            </div>
          </TabsContent>

          <TabsContent value="courses" className="animate-fade-in">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <CourseManagement />
            </div>
          </TabsContent>

          <TabsContent value="classes" className="animate-fade-in">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <ClassManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
