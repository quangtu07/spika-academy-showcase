
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, AlertCircle, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import TeacherClasses from '@/components/teacher/TeacherClasses';
import NotificationBell from '@/components/teacher/NotificationBell';
import TeacherToolbar from '@/components/teacher/TeacherToolbar';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading } = useUserRole();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!userRole || userRole !== 'teacher') {
        toast({
          title: "Truy cập bị từ chối",
          description: "Bạn không có quyền truy cập trang giảng viên. Chỉ giảng viên mới có thể truy cập.",
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
        description: "Vui lòng đăng nhập để truy cập trang giảng viên",
        variant: "destructive",
      });
      navigate('/', { replace: true });
      return;
    }

    const user = JSON.parse(currentUser);
    if (!user.role || user.role !== 'teacher') {
      toast({
        title: "Truy cập bị từ chối",
        description: "Tài khoản của bạn không có quyền truy cập trang giảng viên",
        variant: "destructive",
      });
      navigate('/', { replace: true });
    } else {
      setCurrentTeacherId(user.id);
    }
  }, [navigate, toast]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (!isLoading && (!userRole || userRole !== 'teacher')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg p-4 sm:p-6">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
            <CardTitle className="text-lg sm:text-xl">Truy cập bị từ chối</CardTitle>
            <CardDescription className="text-red-100 text-sm sm:text-base">
              Bạn không có quyền truy cập trang giảng viên. Chỉ giảng viên mới có thể truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3 pt-4 sm:pt-6 p-4 sm:p-6">
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

  if (isLoading || !userRole || userRole !== 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <TeacherToolbar 
        title={isMobile ? "Bảng điều khiển" : "Bảng điều khiển giảng viên"}
        subtitle={isMobile ? "Quản lý lớp học" : "Quản lý lớp học của bạn"}
        rightContent={<NotificationBell teacherId={currentTeacherId} />}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">Lớp học của tôi</CardTitle>
                <CardDescription className="text-blue-100 mt-1 text-sm sm:text-base">
                  Quản lý và theo dõi các lớp học bạn đang giảng dạy
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            <TeacherClasses />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
