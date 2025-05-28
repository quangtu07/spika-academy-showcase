import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, BookOpen, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClassEnrollmentModal from '@/components/admin/ClassEnrollmentModal';

interface Class {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  schedule?: string;
  status?: string;
  created_at: string;
  course_name?: string;
  enrolled_count: number;
  students?: Array<{
    id: string;
    fullname: string;
    email: string;
    enrolled_at: string;
  }>;
  lessons?: Array<{
    id: string;
    title: string;
    description?: string;
    lesson_number: number;
    created_at: string;
  }>;
}

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const { toast } = useToast();

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
          courses!classes_course_id_fkey(name),
          enrollments(
            id,
            student_id,
            enrolled_at,
            profiles!enrollments_student_id_fkey(fullname, email)
          ),
          lessons(
            id,
            title,
            description,
            lesson_number,
            created_at
          )
        `)
        .eq('id', classId)
        .single();

      if (error) throw error;

      const classWithDetails = {
        ...data,
        course_name: data.courses?.name || 'Không xác định',
        enrolled_count: data.enrollments?.length || 0,
        students: data.enrollments?.map((enrollment: any) => ({
          id: enrollment.student_id,
          fullname: enrollment.profiles?.fullname || 'Không xác định',
          email: enrollment.profiles?.email || '',
          enrolled_at: enrollment.enrolled_at
        })) || [],
        lessons: data.lessons?.sort((a: any, b: any) => a.lesson_number - b.lesson_number) || []
      };

      setClassData(classWithDetails);
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
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'completed': 'bg-blue-100 text-blue-800'
    };

    const colorClass = status ? statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {status === 'active' ? 'Đang hoạt động' : 
         status === 'inactive' ? 'Không hoạt động' : 
         status === 'completed' ? 'Đã hoàn thành' : 'Không xác định'}
      </span>
    );
  };

  const handleGoBack = () => {
    const tab = searchParams.get('tab');
    if (tab === 'classes') {
      navigate('/admin', { state: { activeTab: 'classes' } });
    } else {
      navigate('/admin');
    }
  };

  const handleEnrollmentSaved = () => {
    fetchClassDetails();
    setIsEnrollmentModalOpen(false);
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
                    <div><strong>Khóa học:</strong> {classData.course_name}</div>
                    <div><strong>Mô tả:</strong> {classData.description || 'Không có'}</div>
                    <div><strong>Lịch học:</strong> {classData.schedule || 'Chưa xác định'}</div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Trạng thái:</strong> {getStatusBadge(classData.status)}</div>
                    <div><strong>Số học viên:</strong> {classData.enrolled_count}</div>
                    <div><strong>Ngày tạo:</strong> {new Date(classData.created_at).toLocaleDateString('vi-VN')}</div>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Danh sách học viên ({classData.enrolled_count})</CardTitle>
                      <CardDescription>Tất cả học viên đã đăng ký lớp học này</CardDescription>
                    </div>
                    <Button 
                      onClick={() => setIsEnrollmentModalOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm học viên</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {classData.students && classData.students.length > 0 ? (
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
                        {classData.students.map((student, index) => (
                          <TableRow key={student.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{student.fullname}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{new Date(student.enrolled_at).toLocaleDateString('vi-VN')}</TableCell>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Danh sách buổi học ({classData.lessons?.length || 0})</CardTitle>
                      <CardDescription>Tất cả buổi học trong lớp</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {classData.lessons && classData.lessons.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Buổi học</TableHead>
                          <TableHead>Tiêu đề</TableHead>
                          <TableHead>Mô tả</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classData.lessons.map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell className="font-medium">Buổi {lesson.lesson_number}</TableCell>
                            <TableCell>{lesson.title}</TableCell>
                            <TableCell>{lesson.description || '-'}</TableCell>
                            <TableCell>{new Date(lesson.created_at).toLocaleDateString('vi-VN')}</TableCell>
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

      <ClassEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        classData={classData}
        onSaved={handleEnrollmentSaved}
      />
    </>
  );
};

export default ClassDetailPage;
