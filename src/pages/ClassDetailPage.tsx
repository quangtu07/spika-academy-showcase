import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DatabaseClass {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  instructor_id: string;
  course_id: string;
  course: {
    id: string;
    name: string;
    description: string | null;
  };
  instructor: {
    id: string;
    fullname: string;
    email: string;
  }[];
}

interface Class {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  instructor_id: string;
  course_id: string;
  course: {
    id: string;
    name: string;
    description: string | null;
  };
  instructor: {
    id: string;
    fullname: string;
    email: string;
  };
  enrollments: Array<{
    id: string;
    student_id: string;
    enrolled_at: string;
    student: {
      id: string;
      fullname: string;
      email: string;
    } | null;
  }>;
  lessons: Array<{
    id: string;
    title: string;
    content: string | null;
    lesson_number: number;
    created_at: string;
    updated_at: string | null;
  }>;
}

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      // Fetch class details with course and instructor
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          *,
          course:courses!inner (
            id,
            name,
            description
          ),
          instructor:profiles!inner (
            id,
            fullname,
            email
          )
        `)
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      if (!classData) {
        throw new Error('Không tìm thấy thông tin lớp học');
      }

      const dbClass = classData as DatabaseClass;

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          id,
          student_id,
          enrolled_at,
          student:profiles (
            id,
            fullname,
            email
          )
        `)
        .eq('class_id', classId);

      if (enrollmentsError) throw enrollmentsError;

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('class_id', classId)
        .order('lesson_number', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Transform data to match our Class interface
      const transformedData: Class = {
        id: dbClass.id,
        name: dbClass.name,
        description: dbClass.description,
        schedule: dbClass.schedule,
        status: dbClass.status,
        created_at: dbClass.created_at,
        updated_at: dbClass.updated_at,
        instructor_id: dbClass.instructor_id,
        course_id: dbClass.course_id,
        course: dbClass.course,
        instructor: dbClass.instructor[0], // Get first instructor from array
        enrollments: enrollmentsData || [],
        lessons: lessonsData || []
      };

      setClassData(transformedData);
    } catch (error: any) {
      console.error('Error fetching class details:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin lớp học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    const tab = searchParams.get('tab');
    if (tab === 'classes') {
      navigate('/admin', { state: { activeTab: 'classes' } });
    } else {
      navigate('/admin');
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      'active': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800' },
      'inactive': { text: 'Không hoạt động', class: 'bg-gray-100 text-gray-800' },
      'completed': { text: 'Đã hoàn thành', class: 'bg-blue-100 text-blue-800' }
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-100 text-gray-800' };
    const statusInfo = status ? statusMap[status as keyof typeof statusMap] || defaultStatus : defaultStatus;

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
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

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Không tìm thấy lớp học</CardTitle>
            <CardDescription>
              Lớp học không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/admin')} className="w-full">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
                  <p className="text-sm text-gray-600">Chi tiết lớp học</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Class Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thông tin lớp học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Khóa học:</strong> {classData.course?.name || 'Không xác định'}</div>
                    <div><strong>Giảng viên:</strong> {classData.instructor?.fullname || 'Không xác định'}</div>
                    <div><strong>Email giảng viên:</strong> {classData.instructor?.email || 'Không xác định'}</div>
                    <div><strong>Mô tả khóa học:</strong> {classData.course?.description || 'Không có'}</div>
                    <div><strong>Mô tả lớp học:</strong> {classData.description || 'Không có'}</div>
                    <div><strong>Lịch học:</strong> {classData.schedule || 'Chưa xác định'}</div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Trạng thái:</strong> {getStatusBadge(classData.status)}</div>
                    <div><strong>Số học viên:</strong> {classData.enrollments?.length || 0}</div>
                    <div><strong>Số buổi học:</strong> {classData.lessons?.length || 0}</div>
                    <div><strong>Ngày tạo:</strong> {new Date(classData.created_at).toLocaleString('vi-VN')}</div>
                    <div>
                      <strong>Lần cập nhật cuối:</strong> 
                      {classData.updated_at ? new Date(classData.updated_at).toLocaleString('vi-VN') : 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Danh sách học viên</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Danh sách buổi học</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách học viên ({classData.enrollments?.length || 0})</CardTitle>
                  <CardDescription>Tất cả học viên đã đăng ký lớp học này</CardDescription>
                </CardHeader>
                <CardContent>
                  {classData.enrollments && classData.enrollments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>STT</TableHead>
                          <TableHead>Họ tên</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ngày đăng ký</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classData.enrollments.map((enrollment, index) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{enrollment.student?.fullname || 'Không xác định'}</TableCell>
                            <TableCell>{enrollment.student?.email || ''}</TableCell>
                            <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có học viên nào đăng ký lớp này
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lessons">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách buổi học ({classData.lessons?.length || 0})</CardTitle>
                  <CardDescription>Tất cả buổi học trong lớp</CardDescription>
                </CardHeader>
                <CardContent>
                  {classData.lessons && classData.lessons.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Buổi học</TableHead>
                          <TableHead>Tiêu đề</TableHead>
                          <TableHead>Nội dung</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead>Cập nhật lần cuối</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classData.lessons.map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell className="font-medium">Buổi {lesson.lesson_number}</TableCell>
                            <TableCell>{lesson.title}</TableCell>
                            <TableCell>{lesson.content || '-'}</TableCell>
                            <TableCell>{new Date(lesson.created_at).toLocaleString('vi-VN')}</TableCell>
                            <TableCell>
                              {lesson.updated_at ? new Date(lesson.updated_at).toLocaleString('vi-VN') : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có buổi học nào được tạo cho lớp này
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ClassDetailPage; 