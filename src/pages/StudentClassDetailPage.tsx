import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, User, Mail, GraduationCap, Clock, FileText, Award, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudentToolbar from '@/components/student/StudentToolbar';
import StudentNotificationBell from '@/components/student/StudentNotificationBell';

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

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  content: string | null;
  created_at: string;
}

const StudentClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonAssignments, setLessonAssignments] = useState<{[key: string]: boolean}>({});
  const [assignmentProgress, setAssignmentProgress] = useState<{ completed: number; pending: number; total: number }>({ completed: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (classId) {
      checkEnrollment();
    }
  }, [classId]);

  useEffect(() => {
    if (isEnrolled === true) {
      fetchClassDetail();
      fetchLessons();
    } else if (isEnrolled === false) {
      setLoading(false);
    }
  }, [isEnrolled]);

  useEffect(() => {
    if (lessons.length > 0) {
      fetchLessonAssignments();
      fetchAssignmentProgress();
    }
  }, [lessons]);

  const checkEnrollment = async () => {
    try {
      // Get current student ID from localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.error('No current user found');
        setIsEnrolled(false);
        return;
      }
      
      const currentUser = JSON.parse(currentUserStr);
      const studentId = currentUser.id;

      // Check if student is enrolled in this class
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', studentId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      setIsEnrolled(!!data);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra quyền truy cập",
        variant: "destructive",
      });
    }
  };

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

  const fetchAssignmentProgress = async () => {
    try {
      // Get current student ID from localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.error('No current user found');
        return;
      }
      
      const currentUser = JSON.parse(currentUserStr);
      const studentId = currentUser.id;

      // Get all lesson IDs for this class
      const lessonIds = lessons.map(lesson => lesson.id);
      
      if (lessonIds.length === 0) {
        setAssignmentProgress({ completed: 0, pending: 0, total: 0 });
        return;
      }

      // Get all assignments for lessons in this class
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('id, lesson_id')
        .in('lesson_id', lessonIds);

      if (assignmentsError) throw assignmentsError;

      const totalAssignments = assignments?.length || 0;

      if (totalAssignments === 0) {
        setAssignmentProgress({ completed: 0, pending: 0, total: 0 });
        return;
      }

      // Get all submissions for this student
      const assignmentIds = assignments?.map(assignment => assignment.id) || [];
      
      const { data: submissions, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('assignment_id, status')
        .eq('student_id', studentId)
        .in('assignment_id', assignmentIds);

      if (submissionsError) throw submissionsError;

      // Count completed and pending assignments
      const completedAssignments = submissions?.filter(sub => sub.status === 'Đã hoàn thành').length || 0;
      const pendingAssignments = submissions?.filter(sub => sub.status === 'Đang chờ chấm').length || 0;

      setAssignmentProgress({ 
        completed: completedAssignments,
        pending: pendingAssignments,
        total: totalAssignments 
      });

    } catch (error) {
      console.error('Error fetching assignment progress:', error);
      setAssignmentProgress({ completed: 0, pending: 0, total: 0 });
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      'đang hoạt động': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800 border-green-200 shadow-sm' },
      'đã kết thúc': { text: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800 border-gray-200 shadow-sm' },
      'hoàn thành': { text: 'Hoàn thành', class: 'bg-blue-100 text-blue-800 border-blue-200 shadow-sm' },
      'chờ bắt đầu': { text: 'Chờ bắt đầu', class: 'bg-yellow-100 text-yellow-800 border-yellow-200 shadow-sm' },
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-100 text-gray-800 border-gray-200 shadow-sm' };
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

  const handleViewAssignments = (lesson: Lesson) => {
    navigate(`/student/lesson/${lesson.id}/assignments`);
  };

  const calculateProgressPercentage = () => {
    if (assignmentProgress.total === 0) return 0;
    return Math.round((assignmentProgress.completed / assignmentProgress.total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#02458b] rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (isEnrolled === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center bg-[#02458b] text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Không có quyền truy cập</CardTitle>
            <CardDescription className="text-white/80">
              Bạn chưa đăng ký lớp học này hoặc không có quyền truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <Button 
              onClick={() => navigate('/student')} 
              className="w-full bg-[#02458b] hover:bg-[#02458b]/90 shadow-lg"
            >
              Quay lại trang học viên
            </Button>
          </CardContent>
        </Card>
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
              onClick={() => navigate('/student')} 
              className="w-full bg-[#02458b] hover:bg-[#02458b]/90 shadow-lg"
            >
              Quay lại trang học viên
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
          title={classDetail.name}
          subtitle={classDetail.course.name}
          rightContent={<StudentNotificationBell />}
        />

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
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="text-center">
                      <BookOpen className="w-5 h-5 text-white/80 mx-auto mb-1" />
                      <p className="text-white text-lg font-bold">{lessons.length}</p>
                      <p className="text-white/80 text-xs">Buổi học</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="text-center">
                      <Award className="w-5 h-5 text-white/80 mx-auto mb-1" />
                      <p className="text-white text-lg font-bold">{calculateProgressPercentage()}%</p>
                      <p className="text-white/80 text-xs">Hoàn thành</p>
                      <p className="text-white/80 text-xs">({assignmentProgress.completed}/{assignmentProgress.total})</p>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                    <div className="text-center">
                      <Clock className="w-5 h-5 text-white/80 mx-auto mb-1" />
                      <p className="text-white text-lg font-bold">{assignmentProgress.pending}</p>
                      <p className="text-white/80 text-xs">Chờ chấm</p>
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
                      <div className="w-10 h-10 bg-[#02458b] rounded-full flex items-center justify-center">
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

          {/* Mobile Lessons */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#02458b]" />
                <span>Buổi học ({lessons.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#02458b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 w-8 text-[#02458b]" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có buổi học</h4>
                  <p className="text-gray-500">Chưa có buổi học nào được tạo cho lớp này.</p>
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
                        {lessonAssignments[lesson.id] && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              onClick={() => handleViewAssignments(lesson)}
                              className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                            >
                              <Eye className="w-3 h-3 mr-2" />
                              Xem bài tập
                            </Button>
                          </div>
                        )}
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <StudentToolbar
        title="Chi tiết lớp học"
        subtitle={classDetail?.name}
        rightContent={<StudentNotificationBell />}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">Buổi học</p>
                        <p className="text-white text-2xl font-bold">{lessons.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">Bài tập hoàn thành</p>
                        <p className="text-white text-2xl font-bold">{calculateProgressPercentage()}%</p>
                        <p className="text-white/80 text-xs">({assignmentProgress.completed}/{assignmentProgress.total} bài tập)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">Bài tập chờ chấm</p>
                        <p className="text-white text-2xl font-bold">{assignmentProgress.pending}</p>
                        <p className="text-white/80 text-xs">bài tập</p>
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
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-[#02458b] rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">
                              {classDetail?.instructor.fullname.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-2xl">{classDetail?.instructor.fullname}</p>
                            <div className="flex items-center space-x-3 mt-2">
                              <Mail className="w-5 h-5 text-[#02458b]" />
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

          {/* Lessons Section */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b bg-[#02458b]/5">
              <CardTitle className="text-3xl font-bold text-[#02458b] flex items-center space-x-4">
                <BookOpen className="w-8 h-8 text-[#02458b]" />
                <span>Buổi học ({lessons.length})</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-8 p-8">
              {lessons.length === 0 ? (
                <div className="text-center py-16 bg-[#02458b]/5 rounded-3xl border border-[#02458b]/20">
                  <div className="w-24 h-24 bg-[#02458b]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-[#02458b]" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có buổi học nào</h4>
                  <p className="text-gray-500 text-lg">Chưa có buổi học nào được tạo cho lớp này.</p>
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
                          
                          {/* View assignments button */}
                          {lessonAssignments[lesson.id] && (
                            <Button
                              onClick={() => handleViewAssignments(lesson)}
                              className="bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem bài tập
                            </Button>
                          )}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetailPage;
