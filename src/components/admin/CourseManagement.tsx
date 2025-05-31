
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Image, ArrowRight, BookOpen, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CourseFormModal from './CourseFormModal';
import { deleteCourseImage } from '@/lib/storage-helpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image_url?: string;
  status: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
  created_at: string;
  updated_at: string;
  classes?: {
    enrollments: {
      count: number;
    }[];
  }[];
}

interface FormattedCourse extends Course {
  enrolled_count: number;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<FormattedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<FormattedCourse | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<FormattedCourse | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          classes(
            enrollments(count)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedCourses = (data || []).map(course => ({
        ...course,
        enrolled_count: course.classes?.reduce((total, classItem) => 
          total + (classItem.enrollments[0]?.count || 0), 0) || 0
      }));

      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { data: courseToDelete, error: fetchError } = await supabase
        .from('courses')
        .select('image_url')
        .eq('id', courseId)
        .single();

      if (fetchError) throw fetchError;

      if (courseToDelete?.image_url) {
        await deleteCourseImage(courseToDelete.image_url);
      }

      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (deleteError) throw deleteError;

      setCourses(courses.filter(course => course.id !== courseId));
      toast({
        title: "Thành công",
        description: "Đã xóa khóa học thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khóa học",
        variant: "destructive",
      });
    } finally {
      setDeletingCourse(null);
    }
  };

  const handleEditCourse = (course: FormattedCourse) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleCourseSaved = () => {
    fetchCourses();
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const getStatusBadge = (status: Course['status']) => {
    const statusColors = {
      'Đang mở': 'bg-green-100 text-green-800',
      'Đang bắt đầu': 'bg-blue-100 text-blue-800',
      'Kết thúc': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const handleViewCourseDetail = (course: FormattedCourse) => {
    navigate(`/admin/course/${course.id}?tab=courses`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quản lý khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <CardTitle>Quản lý khóa học</CardTitle>
          </div>
          <Button onClick={handleAddCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm khóa học
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{courses.length}</div>
                <div className="text-sm text-gray-600">Tổng khóa học</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{courses.filter(c => c.status === 'Đang mở').length}</div>
                <div className="text-sm text-gray-600">Đang mở</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{courses.reduce((total, course) => total + course.enrolled_count, 0)}</div>
                <div className="text-sm text-gray-600">Tổng học viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{courses.reduce((total, course) => total + course.duration, 0)}</div>
                <div className="text-sm text-gray-600">Tổng buổi học</div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Giá (VNĐ)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-gray-50">
                    <TableCell>
                      {course.image_url ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <img
                            src={course.image_url}
                            alt={course.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{course.name}</div>
                        {course.description && (
                          <div className="text-sm text-gray-500 line-clamp-2">{course.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{course.duration} buổi</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>{course.price ? course.price.toLocaleString('vi-VN') : 'Chưa cập nhật'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{course.enrolled_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeletingCourse(course)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewCourseDetail(course)}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={editingCourse}
        onSaved={handleCourseSaved}
      />

      <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khóa học "{deletingCourse?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCourse && handleDeleteCourse(deletingCourse.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseManagement;
