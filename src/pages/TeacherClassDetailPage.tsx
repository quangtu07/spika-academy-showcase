
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, BookOpen, Calendar, User, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin lớp học...</p>
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Không tìm thấy lớp học</CardTitle>
            <CardDescription>
              Lớp học này có thể đã bị xóa hoặc bạn không có quyền truy cập.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/teacher')} className="w-full">
              Quay lại trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => navigate('/teacher')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chi tiết lớp học</h1>
                <p className="text-sm text-gray-600">{classDetail.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Class Information */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{classDetail.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{classDetail.course.name}</span>
                    </div>
                  </CardDescription>
                </div>
                {getStatusBadge(classDetail.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {classDetail.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mô tả lớp học</h4>
                  <p className="text-gray-600">{classDetail.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Giảng viên</h4>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{classDetail.instructor.fullname}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{classDetail.instructor.email}</span>
                  </div>
                </div>
                
                {classDetail.schedule && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Lịch học</h4>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{classDetail.schedule}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Danh sách học viên ({enrollments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có học viên nào đăng ký lớp học này</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.student.fullname}
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
              )}
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Danh sách buổi học ({lessons.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có buổi học nào được tạo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <Card key={lesson.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Buổi {lesson.lesson_number}: {lesson.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Tạo ngày: {new Date(lesson.created_at).toLocaleDateString('vi-VN')}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {lesson.content && (
                        <CardContent className="pt-0">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Nội dung buổi học</h5>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{lesson.content}</p>
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

export default TeacherClassDetailPage;
