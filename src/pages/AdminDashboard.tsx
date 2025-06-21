import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, BarChart3, AlertCircle, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import UserManagement from '@/components/admin/UserManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import ClassManagement from '@/components/admin/ClassManagement';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminToolbar from '@/components/admin/AdminToolbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [logoutMessage, setLogoutMessage] = useState('');
  const { userRole, isLoading } = useUserRole();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    // Kiểm tra query params
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    
    if (tab) {
      setActiveTab(tab);
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.search, navigate, location.pathname]);



  const tabItems = [
    {
      value: 'overview',
      icon: BarChart3,
      label: 'Tổng quan',
      component: AdminOverview
    },
    {
      value: 'users',
      icon: Users,
      label: 'Người dùng',
      component: UserManagement
    },
    {
      value: 'courses',
      icon: BookOpen,
      label: 'Khóa học',
      component: CourseManagement
    },
    {
      value: 'classes',
      icon: Users,
      label: 'Lớp học',
      component: ClassManagement
    }
  ];

  const ActiveComponent = tabItems.find(item => item.value === activeTab)?.component || AdminOverview;

  if (!isLoading && (!userRole || userRole !== 'admin')) {
    return (
      <>
        {/* Thông báo đăng xuất */}
        {logoutMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg border border-white/20 backdrop-blur-xl flex items-center space-x-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{logoutMessage}</span>
            </div>
          </div>
        )}
        
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
              <CardTitle className="text-lg sm:text-xl">Truy cập bị từ chối</CardTitle>
              <CardDescription className="text-red-100 text-sm">
                Bạn không có quyền truy cập trang quản lý. Chỉ admin mới có thể truy cập.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3 pt-6">
              <p className="text-sm text-gray-600">
                Đang chuyển hướng về trang chủ...
              </p>
              <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Về trang chủ ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isLoading || !userRole || userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        {/* Thông báo đăng xuất */}
        {logoutMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg border border-white/20 backdrop-blur-xl flex items-center space-x-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{logoutMessage}</span>
            </div>
          </div>
        )}
        
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <AdminToolbar title="Quản trị" subtitle="Bảng điều khiển hệ thống" />

          {/* Mobile Content */}
          <div className="p-4">
            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
            <div className="bg-[#02458b] p-4">
                <div className="flex items-center space-x-3">
                  {React.createElement(tabItems.find(item => item.value === activeTab)?.icon || BarChart3, { 
                    className: "h-6 w-6 text-white" 
                  })}
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {tabItems.find(item => item.value === activeTab)?.label}
                    </h2>
                    <p className="text-sm text-blue-100">
                      Quản lý và điều khiển
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <ActiveComponent />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Thông báo đăng xuất */}
      {logoutMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg border border-white/20 backdrop-blur-xl flex items-center space-x-2">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{logoutMessage}</span>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AdminToolbar title="Bảng điều khiển quản trị" subtitle="Quản lý toàn bộ hệ thống" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-[#02458b] text-white rounded-t-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl">Quản lý hệ thống</CardTitle>
                  <CardDescription className="text-blue-100 mt-1 text-sm">
                    Điều khiển và giám sát toàn bộ hoạt động của hệ thống
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 lg:p-8">
              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                navigate(`/admin?tab=${value}`, { replace: true });
              }} className="space-y-6">
                <div className="overflow-x-auto">
                  <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-100 to-indigo-100 p-1 rounded-xl shadow-inner min-w-[400px] sm:min-w-0">
                    {tabItems.map((item) => (
                      <TabsTrigger 
                        key={item.value}
                        value={item.value}
                        className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#02458b] rounded-lg transition-all duration-200 px-2 py-2 text-xs sm:text-sm"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium hidden sm:inline">{item.label}</span>
                        <span className="font-medium sm:hidden text-xs">{item.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {tabItems.map((item) => (
                    <TabsContent key={item.value} value={item.value} className="m-0">
                      <div className="p-4 sm:p-6">
                        <item.component />
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
