
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, BookOpen, Calendar, User, Mail, Plus, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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
      'đang hoạt động': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800' },
      'đã kết thúc': { text: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800' },
      'hoàn thành': { text: 'Hoàn thành', class: 'bg-blue-100 text-blue-800' },
      'chờ bắt đầu': { text: 'Chờ bắt đầu', class: 'bg-yellow-100 text-yellow-800' },
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-100 text-gray-800' };
    const normalizedStatus = status?.toString().trim().toLowerCase();
    
    let statusInfo = defaultStatus;
    if (normalizedStatus && statusMap[normalizedStatus as keyof typeof statusMap]) {
      statusInfo = statusMap[normalizedStatus as keyof typeof statusMap];
    }

    return (
      <Badge className={statusInfo.class}>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">Không tìm thấy lớp học</CardTitle>
            <CardDescription className="text-red-100">
              Lớp học này có thể đã bị xóa hoặc bạn không có quyền truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-6">
            <Button onClick={() => navigate('/teacher')} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
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
              <Button 
                onClick={() => navigate('/teacher')}
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 border-blue-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chi tiết lớp học
                </h1>
                <p className="text-gray-600 mt-1">{classDetail.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Class Information */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{classDetail.name}</CardTitle>
                  <CardDescription className="mt-2 text-blue-100">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-lg">{classDetail.course.name}</span>
                    </div>
                  </CardDescription>
                </div>
                {getStatusBadge(classDetail.status)}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {classDetail.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Mô tả lớp học</h4>
                  <p className="text-gray-700 leading-relaxed">{classDetail.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Giảng viên
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{classDetail.instructor.fullname.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{classDetail.instructor.fullname}</p>
                        <p className="text-gray-600 text-sm">{classDetail.instructor.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {classDetail.schedule && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                      Lịch học
                    </h4>
                    <p className="text-gray-700">{classDetail.schedule}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <Tabs defaultValue="students" className="w-full">
              <CardHeader className="border-b">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="students" className="flex items-center space-x-2 text-lg">
                    <Users className="w-5 h-5" />
                    <span>Học viên ({enrollments.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="lessons" className="flex items-center space-x-2 text-lg">
                    <BookOpen className="w-5 h-5" />
                    <span>Buổi học ({lessons.length})</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="students" className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Danh sách học viên</h3>
                  <Button 
                    onClick={() => setShowEnrollmentModal(true)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm học viên
                  </Button>
                </div>

                {enrollments.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có học viên nào</h4>
                    <p className="text-gray-500 mb-6">Lớp học này chưa có học viên nào đăng ký.</p>
                    <Button 
                      onClick={() => setShowEnrollmentModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm học viên đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <TableRow>
                          <TableHead className="font-semibold">Họ và tên</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Ngày đăng ký</TableHead>
                          <TableHead className="font-semibold">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {enrollment.student.fullname.charAt(0)}
                                  </span>
                                </div>
                                <span>{enrollment.student.fullname}</span>
                              </div>
                            </TableCell>
                            <TableCell>{enrollment.student.email}</TableCell>
                            <TableCell>
                              {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Badge className={enrollment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
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

              <TabsContent value="lessons" className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Danh sách buổi học</h3>
                  <Button 
                    onClick={() => setShowLessonModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm buổi học
                  </Button>
                </div>

                {lessons.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có buổi học nào</h4>
                    <p className="text-gray-500 mb-6">Chưa có buổi học nào được tạo cho lớp này.</p>
                    <Button 
                      onClick={() => setShowLessonModal(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo buổi học đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <Card key={lesson.id} className="shadow-lg hover:shadow-xl transition-shadow border-0 bg-gradient-to-r from-white to-gray-50">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <CardTitle className="text-lg flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">{lesson.lesson_number}</span>
                                </div>
                                <span>{lesson.title}</span>
                              </CardTitle>
                              <CardDescription className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Tạo ngày: {new Date(lesson.created_at).toLocaleDateString('vi-VN')}</span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        {lesson.content && (
                          <CardContent className="pt-0">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                              <h5 className="font-medium text-gray-900 mb-3">Nội dung buổi học</h5>
                              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
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
