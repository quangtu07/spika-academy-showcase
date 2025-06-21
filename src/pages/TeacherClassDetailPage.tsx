import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, BookOpen, Calendar, User, Mail, Plus, GraduationCap, Clock, FileText, Award, Menu, X, Edit, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import TeacherToolbar from '@/components/teacher/TeacherToolbar';
import NotificationBell from '@/components/teacher/NotificationBell';

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
  const [lessonAssignments, setLessonAssignments] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      fetchClassDetail();
      fetchEnrollments();
      fetchLessons();
    }
  }, [classId]);

  useEffect(() => {
    if (lessons.length > 0) {
      fetchLessonAssignments();
    }
  }, [lessons]);

  // Refresh assignments when coming back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (lessons.length > 0) {
        fetchLessonAssignments();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lessons]);

  useEffect(() => {
    // Get teacherId from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setTeacherId(currentUser?.id || null);
    }
  }, []);

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

  const fetchLessonAssignments = async () => {
    try {
      const lessonIds = lessons.map(lesson => lesson.id);
      
      const { data, error } = await (supabase as any)
        .from('assignments')
        .select('lesson_id')
        .in('lesson_id', lessonIds);

      if (error) throw error;

      // Create a map of lesson_id -> hasAssignment
      const assignmentMap: {[key: string]: boolean} = {};
      lessonIds.forEach(id => {
        assignmentMap[id] = data?.some((assignment: any) => assignment.lesson_id === id) || false;
      });

      setLessonAssignments(assignmentMap);
    } catch (error) {
      console.error('Error fetching lesson assignments:', error);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      'đang hoạt động': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800 border-green-200' },
      'đã kết thúc': { text: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800 border-gray-200' },
      'hoàn thành': { text: 'Hoàn thành', class: 'bg-blue-100 text-blue-800 border-blue-200' },
      'chờ bắt đầu': { text: 'Chờ bắt đầu', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-100 text-gray-800 border-gray-200' };
    const normalizedStatus = status?.toString().trim().toLowerCase();
    
    let statusInfo = defaultStatus;
    if (normalizedStatus && statusMap[normalizedStatus as keyof typeof statusMap]) {
      statusInfo = statusMap[normalizedStatus as keyof typeof statusMap];
    }

    return (
      <Badge className={`${statusInfo.class} font-medium px-3 py-1`}>
        {statusInfo.text}
      </Badge>
    );
  };

  const handleCreateEnrollment = () => {
    navigate(`/teacher/class/${classId}/create-enrollment`);
  };

  const handleCreateLesson = () => {
    navigate(`/teacher/class/${classId}/create-lesson`);
  };

  const handleEditLesson = (lesson: Lesson) => {
    navigate(`/teacher/lesson/${lesson.id}/edit`);
  };

  const handleAssignmentForLesson = (lesson: Lesson) => {
    navigate(`/teacher/lesson/${lesson.id}/create-assignment`);
  };

  const handleViewAssignments = (lesson: Lesson) => {
    navigate(`/teacher/lesson/${lesson.id}/assignments`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#02458b] rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center bg-[#02458b] text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Không tìm thấy lớp học</CardTitle>
            <CardDescription className="text-white/80">
              Lớp học này có thể đã bị xóa hoặc bạn không có quyền truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <Button 
              onClick={() => navigate('/teacher')} 
              className="w-full bg-[#02458b] hover:bg-[#02458b]/90 shadow-lg"
            >
              Quay lại trang giảng viên
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
        <TeacherToolbar 
          title={classDetail.name}
          subtitle={classDetail.course.name}
          rightContent={<NotificationBell teacherId={teacherId} />}
        />

        {/* Mobile Actions Menu */}
        {showMobileMenu && (
          <div className="bg-white border-b shadow-lg">
            <div className="px-4 py-3">
              {/* <div className="text-center">
                <p className="text-gray-600 text-sm">Các chức năng đã được di chuyển xuống từng tab tương ứng</p>
              </div> */}
            </div>
          </div>
        )}

        {/* Mobile Class Info Card */}
        <div className="p-4">
          <Card className="shadow-xl border-0 overflow-hidden mb-6">
            <CardHeader className="bg-[#02458b] text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold text-white mb-2">
                      {classDetail.name}
                    </CardTitle>
                    <CardDescription className="text-white/80 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium truncate">{classDetail.course.name}</span>
                    </CardDescription>
                  </div>
                  <div className="ml-3">
                    {getStatusBadge(classDetail.status)}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-center">
                      <Users className="w-6 h-6 text-white/80 mx-auto mb-2" />
                      <p className="text-white text-xl font-bold">{enrollments.length}</p>
                      <p className="text-white/80 text-sm">Học viên</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="text-center">
                      <BookOpen className="w-6 h-6 text-white/80 mx-auto mb-2" />
                      <p className="text-white text-xl font-bold">{lessons.length}</p>
                      <p className="text-white/80 text-sm">Buổi học</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {/* Class Details */}
              <div className="space-y-3">
                {classDetail.description && (
                  <div className="bg-[#02458b]/5 rounded-xl p-4 border border-[#02458b]/20">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-[#02458b]" />
                      Mô tả
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {classDetail.description}
                    </p>
                  </div>
                )}
                
                {/* Teacher & Schedule */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-[#02458b]/5 rounded-xl p-4 border border-[#02458b]/20">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#02458b]" />
                      Giảng viên
                    </h4>
                    <div className="flex items-center space-x-3">
                      {/* <div className="w-10 h-10 bg-[#02458b] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {classDetail.instructor.fullname.charAt(0)}
                        </span>
                      </div> */}
                      <div>
                        <p className="font-medium text-gray-700">{classDetail.instructor.fullname}</p>
                        {/* <p className="text-gray-600 text-sm flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {classDetail.instructor.email}
                        </p> */}
                      </div>
                    </div>
                  </div>
                  
                  {classDetail.schedule && (
                    <div className="bg-[#02458b]/5 rounded-xl p-4 border border-[#02458b]/20">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-[#02458b]" />
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
                <TabsList className="grid w-full grid-cols-2 bg-[#02458b]/10 p-1 rounded-xl">
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
                {/* Add Student Button for Mobile */}
                {/* <div className="mb-4">
                  <Button 
                    onClick={handleCreateEnrollment}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm học viên
                  </Button>
                </div> */}
                
                {enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có học viên</h4>
                    <p className="text-gray-500 mb-4">Lớp học này chưa có học viên nào đăng ký.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#02458b] rounded-full flex items-center justify-center flex-shrink-0">
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
                {/* Add Lesson Button for Mobile */}
                <div className="mb-4">
                  <Button 
                    onClick={handleCreateLesson}
                    className="w-full bg-[#02458b] hover:bg-[#02458b]/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm buổi học
                  </Button>
                </div>
                
                {lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có buổi học</h4>
                    <p className="text-gray-500 mb-4">Chưa có buổi học nào được tạo cho lớp này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <Card key={lesson.id} className="shadow-md border-0 overflow-hidden">
                        <CardHeader className="bg-[#02458b]/5 border-b border-[#02458b]/20">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-[#02458b] rounded-full flex items-center justify-center flex-shrink-0">
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
                          
                          {/* Action button for mobile */}
                          <div className="flex mt-3 space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLesson(lesson)}
                              className="flex-1 bg-[#02458b]/5 border-[#02458b]/30 text-[#02458b] hover:bg-[#02458b]/10"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Sửa
                            </Button>
                            
                            {/* Conditional assignment buttons */}
                            {lessonAssignments[lesson.id] ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewAssignments(lesson)}
                                className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Xem bài tập
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAssignmentForLesson(lesson)}
                                className="flex-1 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Giao bài tập
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        {lesson.content && (
                          <CardContent className="p-4">
                            <div className="bg-[#02458b]/5 rounded-lg p-3 border border-[#02458b]/20">
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
      <TeacherToolbar 
        title="Chi tiết lớp học"
        subtitle={classDetail?.name}
        rightContent={<NotificationBell teacherId={teacherId} />}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Class Information */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-[#02458b] text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-3">
                    <CardTitle className="text-4xl font-bold">{classDetail?.name}</CardTitle>
                    <CardDescription className="text-white/80 flex items-center space-x-3 text-xl">
                      <BookOpen className="w-7 h-7" />
                      <span className="font-semibold">{classDetail?.course.name}</span>
                    </CardDescription>
                  </div>
                  {classDetail && getStatusBadge(classDetail.status)}
                </div>
                
                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white/80 text-lg font-medium">Học viên</p>
                        <p className="text-white text-3xl font-bold">{enrollments.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white/80 text-lg font-medium">Buổi học</p>
                        <p className="text-white text-3xl font-bold">{lessons.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-10 space-y-10">
              {/* Enhanced Class Description */}
              {classDetail?.description && (
                <div className="bg-[#02458b]/5 rounded-3xl p-10 border border-[#02458b]/20 shadow-inner">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-[#02458b] rounded-2xl flex items-center justify-center shadow-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-3xl font-bold text-[#02458b] mb-6">
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
                <div className="bg-[#02458b]/5 rounded-3xl p-10 border border-[#02458b]/20 shadow-xl">
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-[#02458b] rounded-3xl flex items-center justify-center shadow-xl">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-6">Giảng viên</h4>
                      <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#02458b]/20">
                        <div className="space-y-4">
                          <p className="font-bold text-gray-900 text-2xl">{classDetail?.instructor.fullname}</p>
                          <div className="flex items-center space-x-3">
                            <Mail className="w-6 h-6 text-[#02458b]" />
                            <p className="text-gray-700 font-semibold text-xl">{classDetail?.instructor.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Schedule Info */}
                {classDetail?.schedule && (
                  <div className="bg-[#02458b]/5 rounded-3xl p-10 border border-[#02458b]/20 shadow-xl">
                    <div className="flex items-start space-x-6">
                      <div className="w-20 h-20 bg-[#02458b] rounded-3xl flex items-center justify-center shadow-xl">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-gray-900 mb-6">Lịch học</h4>
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#02458b]/20">
                          <div className="flex items-center space-x-4">
                            <Clock className="w-6 h-6 text-[#02458b]" />
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
              <CardHeader className="border-b bg-[#02458b]/5">
                <TabsList className="grid w-full grid-cols-2 h-16 bg-[#02458b]/10 p-2 rounded-2xl">
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
                <div>
                  {/* Add Student Button for Desktop */}
                  {/* <div className="mb-6 flex justify-end">
                    <Button 
                      onClick={handleCreateEnrollment}
                      className="bg-[#02458b] hover:bg-[#02458b]/90 shadow-lg text-lg px-6 py-3"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Thêm học viên
                    </Button>
                  </div> */}
                  
                {enrollments.length === 0 ? (
                  <div className="text-center py-16 bg-[#02458b]/5 rounded-3xl border border-[#02458b]/20">
                    <div className="w-24 h-24 bg-[#02458b]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <GraduationCap className="w-12 h-12 text-[#02458b]" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có học viên nào</h4>
                    <p className="text-gray-500 mb-8 text-lg">Lớp học này chưa có học viên nào đăng ký.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <Table>
                      <TableHeader className="bg-[#02458b]/5">
                        <TableRow>
                          <TableHead className="font-bold text-lg py-6">Họ và tên</TableHead>
                          <TableHead className="font-bold text-lg">Email</TableHead>
                          <TableHead className="font-bold text-lg">Ngày đăng ký</TableHead>
                          <TableHead className="font-bold text-lg">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id} className="hover:bg-[#02458b]/5 transition-colors">
                            <TableCell className="font-medium py-6">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-[#02458b] rounded-full flex items-center justify-center shadow-lg">
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
                </div>
              </TabsContent>

              <TabsContent value="lessons" className="space-y-8 p-8">
                <div>
                  {/* Add Lesson Button for Desktop */}
                  <div className="mb-6 flex justify-end">
                    <Button 
                      onClick={handleCreateLesson}
                      className="bg-[#02458b] hover:bg-[#02458b]/90 shadow-lg text-lg px-6 py-3"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Thêm buổi học
                    </Button>
                  </div>
                  
                {lessons.length === 0 ? (
                  <div className="text-center py-16 bg-[#02458b]/5 rounded-3xl border border-[#02458b]/20">
                    <div className="w-24 h-24 bg-[#02458b]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-[#02458b]" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có buổi học nào</h4>
                    <p className="text-gray-500 mb-8 text-lg">Chưa có buổi học nào được tạo cho lớp này.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {lessons.map((lesson) => (
                      <Card key={lesson.id} className="shadow-xl hover:shadow-2xl transition-shadow border-0 bg-white overflow-hidden">
                        <CardHeader className="pb-4 bg-[#02458b]/5 border-b border-[#02458b]/20">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3">
                              <CardTitle className="text-2xl flex items-center space-x-4">
                                <div className="w-12 h-12 bg-[#02458b] rounded-2xl flex items-center justify-center shadow-lg">
                                  <span className="text-white text-lg font-bold">{lesson.lesson_number}</span>
                                </div>
                                <span>{lesson.title}</span>
                              </CardTitle>
                              <CardDescription className="flex items-center space-x-3 text-lg">
                                <Calendar className="w-5 h-5" />
                                <span>Tạo ngày: {new Date(lesson.created_at).toLocaleDateString('vi-VN')}</span>
                              </CardDescription>
                            </div>
                            
                            {/* Action button for desktop */}
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handleEditLesson(lesson)}
                                className="bg-[#02458b]/5 border-[#02458b]/30 text-[#02458b] hover:bg-[#02458b]/10"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </Button>
                              
                              {/* Conditional assignment buttons */}
                              {lessonAssignments[lesson.id] ? (
                                <Button
                                  variant="outline"
                                  onClick={() => handleViewAssignments(lesson)}
                                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Xem bài tập
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => handleAssignmentForLesson(lesson)}
                                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Giao bài tập
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        {lesson.content && (
                          <CardContent className="pt-6">
                            <div className="bg-[#02458b]/5 rounded-2xl p-8 border border-[#02458b]/20 shadow-inner">
                              <h5 className="font-bold text-gray-900 mb-4 text-xl">Nội dung buổi học</h5>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">{lesson.content}</p>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>


    </div>
  );
};

export default TeacherClassDetailPage;
