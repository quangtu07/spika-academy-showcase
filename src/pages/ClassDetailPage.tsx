import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClassEnrollmentModal from '@/components/admin/ClassEnrollmentModal';
import LessonFormModal from '@/components/admin/LessonFormModal';
import LessonEditModal from '@/components/admin/LessonEditModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Class {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  schedule?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
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
    content?: string;
    lesson_number: number;
    created_at: string;
    updated_at?: string;
  }>;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isLessonEditModalOpen, setIsLessonEditModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
            content,
            lesson_number,
            created_at,
            updated_at
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

  const handleLessonSaved = () => {
    fetchClassDetails();
    setIsLessonModalOpen(false);
  };

  const handleEditLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setIsLessonEditModalOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xóa buổi học",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      fetchClassDetails();
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa buổi học",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedLesson(null);
    }
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
                    <div><strong>Ngày tạo:</strong> {formatDateTime(classData.created_at)}</div>
                    <div><strong>Lần cập nhật cuối:</strong> {classData.updated_at ? formatDateTime(classData.updated_at) : 'Chưa cập nhật'}</div>
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
                    <Button 
                      onClick={() => setIsLessonModalOpen(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Thêm buổi học</span>
                    </Button>
                  </div>
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
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classData.lessons.map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell className="font-medium">Buổi {lesson.lesson_number}</TableCell>
                            <TableCell>{lesson.title}</TableCell>
                            <TableCell>{lesson.content || '-'}</TableCell>
                            <TableCell>{formatDateTime(lesson.created_at)}</TableCell>
                            <TableCell>{lesson.updated_at ? formatDateTime(lesson.updated_at) : '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditLesson(lesson)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedLesson(lesson);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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

      <ClassEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        classData={classData}
        onSaved={handleEnrollmentSaved}
      />

      <LessonFormModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        classData={classData}
        onSaved={() => {
          fetchClassDetails();
          setIsLessonModalOpen(false);
        }}
      />

      <LessonEditModal
        isOpen={isLessonEditModalOpen}
        onClose={() => {
          setIsLessonEditModalOpen(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
        onSaved={() => {
          fetchClassDetails();
          setIsLessonEditModalOpen(false);
          setSelectedLesson(null);
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa buổi học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa buổi học "{selectedLesson?.title}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedLesson(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedLesson && handleDeleteLesson(selectedLesson.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClassDetailPage;
