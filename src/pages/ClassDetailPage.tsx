
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users, BookOpen, Clock, User, GraduationCap, Calendar, Award, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClassDetail {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  status?: string;
  created_at: string;
  course: {
    id: string;
    name: string;
    description?: string;
  };
  instructor: {
    id: string;
    fullname: string;
    email: string;
    avatar_url?: string;
  };
  enrollments: Array<{
    id: string;
    enrolled_at: string;
    student: {
      id: string;
      fullname: string;
      email: string;
      avatar_url?: string;
    };
  }>;
  lessons: Array<{
    id: string;
    title: string;
    lesson_number: number;
    content?: string;
  }>;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const activeTab = searchParams.get('subtab') || 'overview';

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          courses (
            id,
            name,
            description
          ),
          instructor:profiles!classes_instructor_id_fkey (
            id,
            fullname,
            email,
            avatar_url
          ),
          enrollments (
            id,
            enrolled_at,
            student:profiles!enrollments_student_id_fkey (
              id,
              fullname,
              email,
              avatar_url
            )
          ),
          lessons (
            id,
            title,
            lesson_number,
            content
          )
        `)
        .eq('id', classId)
        .single();

      if (error) throw error;
      
      // Transform the data to match the ClassDetail interface
      const transformedData: ClassDetail = {
        ...data,
        course: data.courses, // Map courses to course (singular)
        instructor: Array.isArray(data.instructor) ? data.instructor[0] : data.instructor, // Ensure single instructor object
      };
      
      setClassData(transformedData);
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lớp học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      'Đang diễn ra': 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md',
      'Sắp diễn ra': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md',
      'Đã kết thúc': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-md'
    };

    const colorClass = status ? statusColors[status as keyof typeof statusColors] || statusColors['Sắp diễn ra'] : statusColors['Sắp diễn ra'];

    return (
      <Badge className={`${colorClass} px-3 py-1 text-sm font-medium`}>
        {status || 'Không xác định'}
      </Badge>
    );
  };

  const getInitials = (fullname: string) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleGoBack = () => {
    const tab = searchParams.get('tab');
    if (tab === 'courses') {
      navigate('/admin', { state: { activeTab: 'courses' } });
    } else if (tab === 'classes') {
      navigate('/admin', { state: { activeTab: 'classes' } });
    } else {
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">Không tìm thấy lớp học</CardTitle>
            <CardDescription className="text-red-100">
              Lớp học không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <Button onClick={() => navigate('/admin')} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-green-50 border-green-200 text-green-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Chi tiết lớp học
                </h1>
                <p className="text-sm text-gray-600">Thông tin chi tiết và quản lý học viên</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Header Card */}
        <Card className="mb-8 shadow-xl border-0 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
          
          <CardContent className="relative px-8 pb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end space-y-6 lg:space-y-0 lg:space-x-8 -mt-16">
              {/* Class Icon */}
              <div className="w-32 h-32 bg-white rounded-xl shadow-xl border-4 border-white flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-green-600" />
                </div>
              </div>
              
              {/* Class Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{classData.name}</h2>
                    <p className="text-lg text-gray-600 mt-1">{classData.course.name}</p>
                    <p className="text-gray-500">{classData.description || 'Không có mô tả'}</p>
                  </div>
                  {getStatusBadge(classData.status)}
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Học viên</p>
                      <p className="text-xl font-bold text-gray-900">{classData.enrollments?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bài học</p>
                      <p className="text-xl font-bold text-gray-900">{classData.lessons?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giáo viên</p>
                      <p className="text-sm font-medium text-gray-900">{classData.instructor.fullname}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lịch học</p>
                      <p className="text-sm font-medium text-gray-900">{classData.schedule || 'Chưa xác định'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger 
              value="students"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <Users className="h-4 w-4 mr-2" />
              Học viên
            </TabsTrigger>
            <TabsTrigger 
              value="lessons"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Bài học
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Information */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Thông tin lớp học</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Tên lớp</span>
                      <span className="font-semibold">{classData.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Khóa học</span>
                      <span className="font-semibold text-blue-600">{classData.course.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Lịch học</span>
                      <span className="font-semibold">{classData.schedule || 'Chưa xác định'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                      {getStatusBadge(classData.status)}
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-500">Ngày tạo</span>
                      <span className="font-semibold">{formatDateTime(classData.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructor Information */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Giáo viên phụ trách</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={classData.instructor.avatar_url} alt={classData.instructor.fullname} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-bold">
                        {getInitials(classData.instructor.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{classData.instructor.fullname}</h3>
                      <p className="text-gray-600">{classData.instructor.email}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate(`/admin/user/${classData.instructor.id}?tab=teacher`)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Danh sách học viên</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {classData.enrollments?.length || 0} học viên
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {classData.enrollments && classData.enrollments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Học viên</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Ngày đăng ký</TableHead>
                        <TableHead className="font-semibold text-center">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classData.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id} className="hover:bg-blue-50 transition-colors duration-200">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={enrollment.student.avatar_url} alt={enrollment.student.fullname} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                  {getInitials(enrollment.student.fullname)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{enrollment.student.fullname}</span>
                            </div>
                          </TableCell>
                          <TableCell>{enrollment.student.email}</TableCell>
                          <TableCell>{formatDateTime(enrollment.enrolled_at)}</TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/user/${enrollment.student.id}?tab=student`)}
                            >
                              Xem chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Chưa có học viên nào</p>
                    <p className="text-gray-400">Học viên sẽ hiển thị ở đây khi họ đăng ký lớp học</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Danh sách bài học</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {classData.lessons?.length || 0} bài học
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {classData.lessons && classData.lessons.length > 0 ? (
                  <div className="p-6 space-y-4">
                    {classData.lessons
                      .sort((a, b) => a.lesson_number - b.lesson_number)
                      .map((lesson) => (
                        <div key={lesson.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600 font-bold text-sm">{lesson.lesson_number}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{lesson.title}</h4>
                              {lesson.content && (
                                <p className="text-gray-600 text-sm">{lesson.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Chưa có bài học nào</p>
                    <p className="text-gray-400">Giáo viên có thể thêm bài học cho lớp học này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassDetailPage;
