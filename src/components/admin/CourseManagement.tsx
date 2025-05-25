
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CourseFormModal from './CourseFormModal';

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  level: 'basic' | 'intermediate' | 'advance';
  image_url?: string;
  instructor_id: string;
  instructor_name?: string;
  created_at: string;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
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
          profiles!courses_instructor_id_fkey(fullname)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithInstructor = data?.map(course => ({
        ...course,
        instructor_name: course.profiles?.fullname || 'Không xác định'
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
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

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

  const getLevelBadge = (level: string) => {
    const levelMap = {
      'basic': { label: 'Cơ bản', color: 'bg-green-100 text-green-800' },
      'intermediate': { label: 'Trung cấp', color: 'bg-yellow-100 text-yellow-800' },
      'advance': { label: 'Nâng cao', color: 'bg-red-100 text-red-800' }
    };
    const levelInfo = levelMap[level] || { label: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    return <Badge className={levelInfo.color}>{levelInfo.label}</Badge>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Giáo viên</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
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
                  <TableCell>{getLevelBadge(course.level)}</TableCell>
                  <TableCell>{course.duration ? `${course.duration}h` : '-'}</TableCell>
                  <TableCell>{formatCurrency(course.price)}</TableCell>
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
                        onClick={() => handleDeleteCourse(course.id)}
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
    </>
  );
};

export default CourseManagement;
