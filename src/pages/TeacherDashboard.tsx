
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, AlertCircle, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import TeacherClasses from '@/components/teacher/TeacherClasses';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading } = useUserRole();
  const { toast } = useToast();

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
    }
  }, [navigate, toast]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (!isLoading && (!userRole || userRole !== 'teacher')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-xl">Truy cập bị từ chối</CardTitle>
            <CardDescription className="text-red-100">
              Bạn không có quyền truy cập trang giảng viên. Chỉ giảng viên mới có thể truy cập.
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

  if (isLoading || !userRole || userRole !== 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Bảng điều khiển giảng viên
                </h1>
                <p className="text-gray-600 mt-1">Quản lý lớp học của bạn</p>
              </div>
            </div>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200 text-blue-700"
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
          <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl">Lớp học của tôi</CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Quản lý và theo dõi các lớp học bạn đang giảng dạy
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <TeacherClasses />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
