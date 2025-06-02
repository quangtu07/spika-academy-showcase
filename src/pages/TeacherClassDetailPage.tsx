import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, BookOpen, Calendar, User, Mail, Plus, GraduationCap, Clock, FileText, Award, Menu, X, Edit, ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import EnrollmentFormModal from '@/components/admin/EnrollmentFormModal';
import LessonFormModal from '@/components/admin/LessonFormModal';

interface ClassDetail {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  status: string | null;
  course: {
    name: string;
    description: string | null;
  };
  instructor: {
    fullname: string;
    email: string;
  };
}

interface Enrollment {
  id: string;
  enrolled_at: string;
  status: string;
  student: {
    fullname: string;
    email: string;
  };
}

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  content: string | null;
  created_at: string;
}

const TeacherClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchEnrollments();
      fetchLessons();
    }
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          schedule,
          status,
          courses (
            name,
            description
          ),
          instructor:profiles (
            fullname,
            email
          )
        `)
        .eq('id', classId)
        .single();

      if (error) throw error;

      setClassDetail({
        id: data.id,
        name: data.name,
        description: data.description,
        schedule: data.schedule,
        status: data.status,
        course: data.courses || { name: 'Không xác định', description: null },
        instructor: data.instructor || { fullname: 'Không xác định', email: '' }
      });
    } catch (error) {
      console.error('Error fetching class detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lớp học",
        variant: "destructive",
      });
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          status,
          student:profiles (
            fullname,
            email
          )
        `)
        .eq('class_id', classId);

      if (error) throw error;

      const formattedEnrollments = data?.map(enrollment => ({
        id: enrollment.id,
        enrolled_at: enrollment.enrolled_at,
        status: enrollment.status || 'active',
        student: enrollment.student || { fullname: 'Không xác định', email: '' }
      })) || [];

      setEnrollments(formattedEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học viên",
        variant: "destructive",
      });
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          lesson_number,
          title,
          content,
          created_at
        `)
        .eq('class_id', classId)
        .order('lesson_number', { ascending: true });

      if (error) throw error;

      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách buổi học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      'đang hoạt động': { text: 'Đang hoạt động', class: 'bg-emerald-500/15 text-emerald-700 border-emerald-300 shadow-sm' },
      'đã kết thúc': { text: 'Đã kết thúc', class: 'bg-gray-500/15 text-gray-700 border-gray-300 shadow-sm' },
      'hoàn thành': { text: 'Hoàn thành', class: 'bg-blue-500/15 text-blue-700 border-blue-300 shadow-sm' },
      'chờ bắt đầu': { text: 'Chờ bắt đầu', class: 'bg-amber-500/15 text-amber-700 border-amber-300 shadow-sm' },
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-500/15 text-gray-700 border-gray-300 shadow-sm' };
    const normalizedStatus = status?.toString().trim().toLowerCase();
    
    let statusInfo = defaultStatus;
    if (normalizedStatus && statusMap[normalizedStatus as keyof typeof statusMap]) {
      statusInfo = statusMap[normalizedStatus as keyof typeof statusMap];
    }

    return (
      <Badge className={`${statusInfo.class} border font-medium px-3 py-1`}>
        {statusInfo.text}
      </Badge>
    );
  };

  const handleEnrollmentSaved = () => {
    fetchEnrollments();
    setShowEnrollmentModal(false);
  };

  const handleLessonSaved = () => {
    fetchLessons();
    setShowLessonModal(false);
  };

  const handleEditLesson = (lesson: Lesson) => {
    // TODO: Implement edit lesson functionality
    toast({
      title: "Chỉnh sửa buổi học",
      description: `Chỉnh sửa buổi học: ${lesson.title}`,
    });
  };

  const handleAssignHomework = (lesson: Lesson) => {
    // TODO: Implement assignment functionality
    toast({
      title: "Giao bài tập",
      description: `Giao bài tập cho buổi học: ${lesson.title}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Không tìm thấy lớp học</CardTitle>
            <CardDescription className="text-red-100">
              Lớp học này có thể đã bị xóa hoặc bạn không có quyền truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <Button 
              onClick={() => navigate('/admin')} 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
            >
              Quay lại trang quản trị
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
        <div className="bg-white shadow-lg border-b sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={() => navigate('/admin')}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                    {classDetail.name}
                  </h1>
                  <p className="text-xs text-gray-500 truncate">{classDetail.course.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2"
              >
                {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Actions Menu */}
        {showMobileMenu && (
          <div className="bg-white border-b shadow-lg">
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    setShowEnrollmentModal(true);
                    setShowMobileMenu(false);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm học viên
                </Button>
                <Button
                  onClick={() => {
                    setShowLessonModal(true);
                    setShowMobileMenu(false);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm buổi học
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Class Info Card */}
        <div className="p-4">
          <Card className="shadow-xl border-0 overflow-hidden mb-6">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-white mb-2">
                      {classDetail.name}
                    </CardTitle>
                    <CardDescription className="text-indigo-100 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium truncate">{classDetail.course.name}</span>
                    </CardDescription>
                  </div>
                  <div className="ml-3">
                    {getStatusBadge(classDetail.status)}
                  </div>
                </div>
                
                {/* Quick Stats - Remove ranking */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="text-center">
                      <Users className="w-5 h-5 text-indigo-100 mx-auto mb-1" />
                      <p className="text-white text-lg font-bold">{enrollments.length}</p>
                      <p className="text-indigo-100 text-xs">Học viên</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="text-center">
                      <BookOpen className="w-5 h-5 text-purple-100 mx-auto mb-1" />
                      <p className="text-white text-lg font-bold">{lessons.length}</p>
                      <p className="text-purple-100 text-xs">Buổi học</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="text-center">
                      <Award className="w-5 h-5 text-pink-100 mx-auto mb-1" />
                      <p className="text-white text-lg font-bold">85%</p>
                      <p className="text-pink-100 text-xs">Hoàn thành</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {/* Class Details */}
              <div className="space-y-3">
                {classDetail.description && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                      Mô tả
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {classDetail.description}
                    </p>
                  </div>
                )}
                
                {/* Teacher & Schedule */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      Giảng viên
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {classDetail.instructor.fullname.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{classDetail.instructor.fullname}</p>
                        <p className="text-gray-600 text-sm flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {classDetail.instructor.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {classDetail.schedule && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-500" />
                        Lịch học
                      </h4>
                      <p className="text-gray-700 font-medium">{classDetail.schedule}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Tabs */}
          <Card className="shadow-xl border-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-indigo-100 to-purple-100 p-1 rounded-xl">
                  <TabsTrigger 
                    value="students" 
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Học viên ({enrollments.length})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lessons"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">Buổi học ({lessons.length})</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="students" className="p-4 pt-0">
                {enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có học viên</h4>
                    <p className="text-gray-500 mb-4">Lớp học này chưa có học viên nào đăng ký.</p>
                    <Button 
                      onClick={() => setShowEnrollmentModal(true)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm học viên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {enrollment.student.fullname.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{enrollment.student.fullname}</p>
                            <p className="text-gray-600 text-sm truncate">{enrollment.student.email}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-gray-500 text-xs">
                                {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                              </p>
                              <Badge className={enrollment.status === 'active' 
                                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300' 
                                : 'bg-gray-500/15 text-gray-700 border-gray-300'
                              }>
                                {enrollment.status === 'active' ? 'Đang học' : 'Không hoạt động'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lessons" className="p-4 pt-0">
                {lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có buổi học</h4>
                    <p className="text-gray-500 mb-4">Chưa có buổi học nào được tạo cho lớp này.</p>
                    <Button 
                      onClick={() => setShowLessonModal(true)}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo buổi học
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <Card key={lesson.id} className="shadow-md border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">{lesson.lesson_number}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg text-gray-900">{lesson.title}</CardTitle>
                              <CardDescription className="flex items-center space-x-2 mt-1">
                                <Calendar className="w-3 h-3" />
                                <span className="text-xs">
                                  {new Date(lesson.created_at).toLocaleDateString('vi-VN')}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                          
                          {/* Action buttons for mobile */}
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLesson(lesson)}
                              className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Chỉnh sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAssignHomework(lesson)}
                              className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-teal-100"
                            >
                              <ClipboardList className="w-3 h-3 mr-1" />
                              Giao bài tập
                            </Button>
                          </div>
                        </CardHeader>
                        {lesson.content && (
                          <CardContent className="p-4">
                            <div className="bg-gradient-to-r from-gray-50 to-violet-50 rounded-lg p-3 border border-gray-100">
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {lesson.content}
                              </p>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
                className="hover:bg-indigo-50 border-indigo-200 text-indigo-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại quản trị
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Chi tiết lớp học
                </h1>
                <p className="text-gray-600 mt-1">{classDetail?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowEnrollmentModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm học viên
              </Button>
              <Button 
                onClick={() => setShowLessonModal(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm buổi học
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Class Information */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-3">
                    <CardTitle className="text-4xl font-bold">{classDetail?.name}</CardTitle>
                    <CardDescription className="text-indigo-100 flex items-center space-x-3 text-xl">
                      <BookOpen className="w-7 h-7" />
                      <span className="font-semibold">{classDetail?.course.name}</span>
                    </CardDescription>
                  </div>
                  {classDetail && getStatusBadge(classDetail.status)}
                </div>
                
                {/* Enhanced Quick Stats - Remove ranking */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-100" />
                      </div>
                      <div>
                        <p className="text-indigo-100 text-sm font-medium">Học viên</p>
                        <p className="text-white text-2xl font-bold">{enrollments.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-purple-100" />
                      </div>
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Buổi học</p>
                        <p className="text-white text-2xl font-bold">{lessons.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-100" />
                      </div>
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Hoàn thành</p>
                        <p className="text-white text-2xl font-bold">85%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-10 space-y-10">
              {/* Enhanced Class Description */}
              {classDetail?.description && (
                <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-10 border border-indigo-100 shadow-inner">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Mô tả lớp học
                      </h4>
                      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <p className="text-gray-700 leading-relaxed text-xl whitespace-pre-wrap">
                          {classDetail.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Enhanced Teacher and Schedule Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Teacher Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-10 border border-blue-200 shadow-xl">
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-xl">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-6">Giảng viên</h4>
                      <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">
                              {classDetail?.instructor.fullname.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-2xl">{classDetail?.instructor.fullname}</p>
                            <div className="flex items-center space-x-3 mt-2">
                              <Mail className="w-5 h-5 text-blue-500" />
                              <p className="text-gray-600 text-lg">{classDetail?.instructor.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Schedule Info */}
                {classDetail?.schedule && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl p-10 border border-purple-200 shadow-xl">
                    <div className="flex items-start space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-gray-900 mb-6">Lịch học</h4>
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
                          <div className="flex items-center space-x-4">
                            <Clock className="w-6 h-6 text-purple-500" />
                            <p className="text-gray-700 font-semibold text-xl">{classDetail.schedule}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Tabs Section */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <Tabs defaultValue="students" className="w-full">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-indigo-50">
                <TabsList className="grid w-full grid-cols-2 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 p-2 rounded-2xl">
                  <TabsTrigger 
                    value="students" 
                    className="flex items-center space-x-3 text-lg data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl"
                  >
                    <Users className="w-6 h-6" />
                    <span className="font-semibold">Học viên ({enrollments.length})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lessons" 
                    className="flex items-center space-x-3 text-lg data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl"
                  >
                    <BookOpen className="w-6 h-6" />
                    <span className="font-semibold">Buổi học ({lessons.length})</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="students" className="space-y-8 p-8">
                {enrollments.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-3xl border border-gray-100">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <GraduationCap className="w-12 h-12 text-gray-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có học viên nào</h4>
                    <p className="text-gray-500 mb-8 text-lg">Lớp học này chưa có học viên nào đăng ký.</p>
                    <Button 
                      onClick={() => setShowEnrollmentModal(true)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg text-lg px-8 py-3"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Thêm học viên đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                        <TableRow>
                          <TableHead className="font-bold text-lg py-6">Họ và tên</TableHead>
                          <TableHead className="font-bold text-lg">Email</TableHead>
                          <TableHead className="font-bold text-lg">Ngày đăng ký</TableHead>
                          <TableHead className="font-bold text-lg">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id} className="hover:bg-indigo-50/50 transition-colors">
                            <TableCell className="font-medium py-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white text-lg font-bold">
                                    {enrollment.student.fullname.charAt(0)}
                                  </span>
                                </div>
                                <span className="text-lg">{enrollment.student.fullname}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-lg">{enrollment.student.email}</TableCell>
                            <TableCell className="text-lg">
                              {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Badge className={enrollment.status === 'active' 
                                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300 text-sm px-4 py-2' 
                                : 'bg-gray-500/15 text-gray-700 border-gray-300 text-sm px-4 py-2'
                              }>
                                {enrollment.status === 'active' ? 'Đang học' : 'Không hoạt động'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lessons" className="space-y-8 p-8">
                {lessons.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl border border-gray-100">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-gray-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có buổi học nào</h4>
                    <p className="text-gray-500 mb-8 text-lg">Chưa có buổi học nào được tạo cho lớp này.</p>
                    <Button 
                      onClick={() => setShowLessonModal(true)}
                      className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg text-lg px-8 py-3"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Tạo buổi học đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {lessons.map((lesson) => (
                      <Card key={lesson.id} className="shadow-xl hover:shadow-2xl transition-shadow border-0 bg-gradient-to-r from-white to-purple-50 overflow-hidden">
                        <CardHeader className="pb-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3">
                              <CardTitle className="text-2xl flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                  <span className="text-white text-lg font-bold">{lesson.lesson_number}</span>
                                </div>
                                <span>{lesson.title}</span>
                              </CardTitle>
                              <CardDescription className="flex items-center space-x-3 text-lg">
                                <Calendar className="w-5 h-5" />
                                <span>Tạo ngày: {new Date(lesson.created_at).toLocaleDateString('vi-VN')}</span>
                              </CardDescription>
                            </div>
                            
                            {/* Action buttons for desktop */}
                            <div className="flex space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => handleEditLesson(lesson)}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleAssignHomework(lesson)}
                                className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-teal-100"
                              >
                                <ClipboardList className="w-4 h-4 mr-2" />
                                Giao bài tập
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {lesson.content && (
                          <CardContent className="pt-6">
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border border-violet-100 shadow-inner">
                              <h5 className="font-bold text-gray-900 mb-4 text-xl">Nội dung buổi học</h5>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">{lesson.content}</p>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showEnrollmentModal && (
        <EnrollmentFormModal
          isOpen={showEnrollmentModal}
          onClose={() => setShowEnrollmentModal(false)}
          onSaved={handleEnrollmentSaved}
        />
      )}

      {showLessonModal && classDetail && (
        <LessonFormModal
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          classData={classDetail}
          onSaved={handleLessonSaved}
        />
      )}
    </div>
  );
};

export default TeacherClassDetailPage;
