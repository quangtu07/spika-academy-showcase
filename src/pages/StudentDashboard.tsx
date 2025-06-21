import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, BookOpen, MessageSquare, User, GraduationCap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudentCourses from '@/components/student/StudentCourses';
import StudentProfile from '@/components/student/StudentProfile';
import StudentNotificationBell from '@/components/student/StudentNotificationBell';
import StudentToolbar from '@/components/student/StudentToolbar';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('courses');
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
    const tab = searchParams.get('tab');
    if (tab && (tab === 'courses' || tab === 'profile')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center bg-[#02458b] text-white">
            <CardTitle className="text-xl">Truy cập bị từ chối</CardTitle>
            <CardDescription className="text-white/80">
              Bạn không có quyền truy cập trang học viên.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-8">
            <Button onClick={handleGoHome} className="w-full bg-[#02458b] hover:bg-[#02458b]/90">
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
        <StudentToolbar 
          title="Học viên"
          subtitle="Bảng điều khiển"
          rightContent={<StudentNotificationBell />}
        />

        {/* Mobile Content */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger 
                value="courses" 
                className="flex items-center space-x-2 data-[state=active]:bg-[#02458b] data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Khóa học</span>
                <span className="sm:hidden">Học</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center space-x-2 data-[state=active]:bg-[#02458b] data-[state=active]:text-white"
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
      <StudentToolbar 
        title="Học viên"
        subtitle="Bảng điều khiển học viên"
        rightContent={<StudentNotificationBell />}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/70 backdrop-blur-sm shadow-xl border-0 h-14">
              <TabsTrigger 
                value="courses" 
                className="flex items-center space-x-3 text-base data-[state=active]:bg-[#02458b] data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <BookOpen className="h-5 w-5" />
                <span>Khóa học</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center space-x-3 text-base data-[state=active]:bg-[#02458b] data-[state=active]:text-white data-[state=active]:shadow-lg"
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
