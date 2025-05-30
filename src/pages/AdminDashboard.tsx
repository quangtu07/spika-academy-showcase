
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users, BookOpen, BarChart3, AlertCircle, Settings } from 'lucide-react';
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
    if (!isLoading) {
      if (!userRole || userRole !== 'admin') {
        toast({
          title: "Truy cập bị từ chối",
          description: "Bạn không có quyền truy cập trang quản lý. Chỉ admin mới có thể truy cập.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    }
  }, [userRole, isLoading, navigate, toast]);

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
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (!isLoading && (!userRole || userRole !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-xl">Truy cập bị từ chối</CardTitle>
            <CardDescription className="text-red-100">
              Bạn không có quyền truy cập trang quản lý. Chỉ admin mới có thể truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3 pt-6">
            <p className="text-sm text-gray-600">
              Đang chuyển hướng về trang chủ...
            </p>
            <Button onClick={handleGoHome} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Về trang chủ ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !userRole || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Bảng điều khiển quản trị
                </h1>
                <p className="text-gray-600 mt-1">Quản lý toàn bộ hệ thống</p>
              </div>
            </div>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-purple-50 border-purple-200 text-purple-700"
            >
              <Home className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Quản lý hệ thống</CardTitle>
                <CardDescription className="text-purple-100 mt-1">
                  Điều khiển và giám sát toàn bộ hoạt động của hệ thống
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-100 to-blue-100 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 rounded-lg transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Tổng quan</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 rounded-lg transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Người dùng</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="courses" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 rounded-lg transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Khóa học</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="classes" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 rounded-lg transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Lớp học</span>
                </TabsTrigger>
              </TabsList>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <TabsContent value="overview" className="m-0">
                  <div className="p-6">
                    <AdminOverview />
                  </div>
                </TabsContent>

                <TabsContent value="users" className="m-0">
                  <div className="p-6">
                    <UserManagement />
                  </div>
                </TabsContent>

                <TabsContent value="courses" className="m-0">
                  <div className="p-6">
                    <CourseManagement />
                  </div>
                </TabsContent>

                <TabsContent value="classes" className="m-0">
                  <div className="p-6">
                    <ClassManagement />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
