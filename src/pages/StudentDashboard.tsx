
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, BookOpen, MessageSquare, User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudentCourses from '@/components/student/StudentCourses';
import StudentProfile from '@/components/student/StudentProfile';
import StudentNotificationBell from '@/components/student/StudentNotificationBell';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const { userRole, isLoading } = useUserRole();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && userRole !== 'student') {
      toast({
        title: "Truy cập bị từ chối",
        description: "Bạn không có quyền truy cập trang học viên",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [userRole, isLoading, navigate, toast]);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setCurrentStudentId(user.id);
    }
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardTitle className="text-xl">Truy cập bị từ chối</CardTitle>
            <CardDescription className="text-white/80">
              Bạn không có quyền truy cập trang học viên.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-8">
            <Button onClick={handleGoHome} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg sticky top-0 z-50">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Học viên</h1>
                  <p className="text-white/80 text-sm">Bảng điều khiển</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <StudentNotificationBell studentId={currentStudentId} />
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger 
                value="courses" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Khóa học</span>
                <span className="sm:hidden">Học</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Hồ sơ</span>
                <span className="sm:hidden">Hồ sơ</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-0">
              <StudentCourses />
            </TabsContent>

            <TabsContent value="profile" className="space-y-0">
              <StudentProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Học viên
                </h1>
                <p className="text-gray-600 mt-1">Bảng điều khiển học viên</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <StudentNotificationBell studentId={currentStudentId} />
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-indigo-50 border-indigo-200 text-indigo-700"
              >
                <Home className="h-4 w-4" />
                <span>Về trang chủ</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/70 backdrop-blur-sm shadow-xl border-0 h-14">
              <TabsTrigger 
                value="courses" 
                className="flex items-center space-x-3 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <BookOpen className="h-5 w-5" />
                <span>Khóa học</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center space-x-3 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <User className="h-5 w-5" />
                <span>Hồ sơ</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="courses">
            <StudentCourses />
          </TabsContent>

          <TabsContent value="profile">
            <StudentProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
