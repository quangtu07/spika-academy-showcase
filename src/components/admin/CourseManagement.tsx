import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Image } from 'lucide-react';
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

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image_url?: string;
  instructor_id: string;
  instructor_name?: string;
  status?: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
  created_at: string;
  enrolled_count: number;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(fullname),
          classes(
            enrollments(count)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const coursesWithInstructor = data?.map(course => ({
        ...course,
        instructor_name: course.profiles?.fullname || 'Không xác định',
        enrolled_count: course.classes?.reduce((total, classItem) => 
          total + (classItem.enrollments[0]?.count || 0), 0) || 0
      })) || [];

      setCourses(coursesWithInstructor);
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
      // Lấy thông tin khóa học trước khi xóa để kiểm tra ảnh
      const { data: courseToDelete, error: fetchError } = await supabase
        .from('courses')
        .select('image_url')
        .eq('id', courseId)
        .single();

      if (fetchError) throw fetchError;

      // Nếu khóa học có ảnh, xóa ảnh trước
      if (courseToDelete?.image_url) {
        await deleteCourseImage(courseToDelete.image_url);
      }

      // Sau đó xóa khóa học
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

  const handleEditCourse = (course: Course) => {
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

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      'Đang mở': 'bg-green-100 text-green-800',
      'Đang bắt đầu': 'bg-blue-100 text-blue-800',
      'Kết thúc': 'bg-gray-100 text-gray-800'
    };

    const colorClass = status ? statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {status || 'Không xác định'}
      </span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quản lý khóa học</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quản lý khóa học</CardTitle>
              <CardDescription>
                Quản lý tất cả khóa học trong hệ thống
              </CardDescription>
            </div>
            <Button onClick={handleAddCourse} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm khóa học</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Học viên</span>
                  </div>
                </TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    {course.image_url ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={course.image_url}
                          alt={course.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{course.name}</div>
                      {course.description && (
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {course.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{course.instructor_name}</TableCell>
                  <TableCell>{course.duration ? `${course.duration} buổi` : '-'}</TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{course.enrolled_count}</span>
                      <span className="text-gray-500">học viên</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingCourse(course)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default CourseManagement;
