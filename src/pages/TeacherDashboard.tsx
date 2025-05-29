import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classes');
  const { userRole, isLoading } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && userRole !== 'teacher') {
      toast({
        title: "Truy cập bị từ chối",
        description: "Bạn không có quyền truy cập trang giảng viên",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [userRole, isLoading, navigate, toast]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Truy cập bị từ chối</CardTitle>
            <CardDescription>
              Bạn không có quyền truy cập trang giảng viên.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleGoHome} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Giảng viên</h1>
                <p className="text-sm text-gray-600">Bảng điều khiển giảng viên</p>
              </div>
            </div>
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Về trang chủ</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="classes" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Lớp học</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            {/* <TeacherClasses /> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
