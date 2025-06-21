import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, Image, ArrowRight, BookOpen, Star, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [deletingCourse, setDeletingCourse] = useState<FormattedCourse | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const handleEditCourse = (course: FormattedCourse) => {
    navigate(`/admin/course/edit/${course.id}`);
  };

  const handleAddCourse = () => {
    navigate('/admin/course/create');
  };

  const getStatusBadge = (status: Course['status']) => {
    const statusColors = {
      'Đang mở': 'bg-green-100 text-green-800 border-green-200',
      'Đang bắt đầu': 'bg-blue-100 text-blue-800 border-blue-200',
      'Kết thúc': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

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

  const handleViewCourseDetail = (course: FormattedCourse) => {
    navigate(`/admin/course/${course.id}?tab=courses`);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-[#02458b] text-white rounded-t-lg">
          <CardTitle className="text-lg sm:text-xl">Quản lý khóa học</CardTitle>
          <CardDescription className="text-blue-100">Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-[#02458b] text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
              <div>
                <CardTitle className="text-lg sm:text-2xl">Quản lý khóa học</CardTitle>
                <CardDescription className="text-blue-100 mt-1 text-sm">
                  Quản lý tất cả khóa học trong hệ thống
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleAddCourse} 
              className="bg-white text-[#02458b] hover:bg-gray-100 border-0 shadow-lg w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Thêm khóa học</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#02458b] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{courses.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Tổng khóa học</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1294fb] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <Star className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{courses.filter(c => c.status === 'Đang mở').length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Đang mở</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#02458b] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{courses.reduce((total, course) => total + course.enrolled_count, 0)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Tổng học viên</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ffc418] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-gray-900" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{courses.reduce((total, course) => total + course.duration, 0)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Tổng buổi học</div>
                </div>
              </div>
            </div>

            {isMobile ? (
              // Mobile Card Layout
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {course.image_url ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                            <img
                              src={course.image_url}
                              alt={course.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{course.name}</h3>
                            {getStatusBadge(course.status)}
                          </div>
                          
                          {course.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                              {course.description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{course.duration} buổi</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{course.enrolled_count} học viên</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600 col-span-2">
                              <DollarSign className="h-3 w-3" />
                              <span className="font-medium">
                                {course.price ? course.price.toLocaleString('vi-VN') : 'Chưa cập nhật'} VNĐ
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                                className="h-7 px-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {/* <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingCourse(course)}
                                className="h-7 px-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button> */}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCourseDetail(course)}
                              className="h-7 px-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Desktop Table Layout
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold text-gray-700">Ảnh</TableHead>
                        <TableHead className="font-semibold text-gray-700">Tên khóa học</TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Thời lượng</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Giá (VNĐ)</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Học viên</span>
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course, index) => (
                        <TableRow 
                          key={course.id}
                          className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                        >
                          <TableCell>
                            {course.image_url ? (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md">
                                <img
                                  src={course.image_url}
                                  alt={course.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-md">
                                <Image className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">{course.name}</div>
                              {course.description && (
                                <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                                  {course.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-gray-700">
                              <span className="font-medium">{course.duration}</span>
                              <span className="text-sm">buổi</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {course.price ? course.price.toLocaleString('vi-VN') : 'Chưa cập nhật'}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(course.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-blue-600">{course.enrolled_count}</span>
                              <span className="text-gray-500 text-sm">học viên</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {/* <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingCourse(course)}
                                className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button> */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCourseDetail(course)}
                                className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <AlertDialogContent className="border-0 shadow-xl mx-4 max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl text-gray-800">Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-sm">
              Bạn có chắc chắn muốn xóa khóa học "{deletingCourse?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="hover:bg-gray-100 w-full sm:w-auto">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCourse && handleDeleteCourse(deletingCourse.id)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 w-full sm:w-auto"
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
