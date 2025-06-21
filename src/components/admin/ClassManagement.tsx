import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Edit, Trash2, Users, ArrowRight, GraduationCap, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClassFormModal from './ClassFormModal';
import ClassEnrollmentModal from './ClassEnrollmentModal';
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
import { useIsMobile } from '@/hooks/use-mobile';

interface Class {
  id: string;
  course_id: string;
  instructor_id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  course?: {
    name: string;
  };
  instructor?: {
    fullname: string;
  };
  enrollments?: Array<{
    student_id: string;
    enrolled_at: string;
    profiles: {
      fullname: string;
      email: string;
    };
  }>;
}

interface SupabaseClass extends Omit<Class, 'course' | 'instructor'> {
  course: { name: string } | null;
  instructor: { fullname: string } | null;
}

interface EditClassData {
  id: string;
  course_id: string;
  instructor_id: string;
  name: string;
  description: string;
  schedule: string;
  status: string;
}

const ClassManagement = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<EditClassData | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          courses (
            name
          ),
          teacher:profiles (
            fullname
          ),
          enrollments (
            student_id,
            enrolled_at,
            student:profiles (
              fullname,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data as any[]).map(item => ({
        id: item.id,
        course_id: item.course_id,
        instructor_id: item.instructor_id,
        name: item.name,
        description: item.description,
        schedule: item.schedule,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        course: item.courses,
        instructor: item.teacher,
        enrollments: item.enrollments?.map(enrollment => ({
          ...enrollment,
          profiles: enrollment.student
        }))
      })) as Class[];

      console.log('Fetched data:', data);
      console.log('Transformed data:', transformedData);

      setClasses(transformedData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lớp học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      // Kiểm tra xem lớp học có buổi học nào không
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('class_id', classId);

      if (lessonsError) throw lessonsError;

      // Nếu có buổi học, xóa tất cả buổi học trước
      if (lessons && lessons.length > 0) {
        const { error: deleteLessonsError } = await supabase
          .from('lessons')
          .delete()
          .eq('class_id', classId);

        if (deleteLessonsError) throw deleteLessonsError;
      }

      // Sau đó xóa lớp học
      const { error: deleteClassError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (deleteClassError) throw deleteClassError;

      setClasses(classes.filter(cls => cls.id !== classId));
      toast({
        title: "Thành công",
        description: "Đã xóa lớp học và các buổi học liên quan thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa lớp học",
        variant: "destructive",
      });
    } finally {
      setDeletingClass(null);
    }
  };

  const handleEditClass = (classItem: Class) => {
    const editData: EditClassData = {
      id: classItem.id,
      course_id: classItem.course_id,
      instructor_id: classItem.instructor_id,
      name: classItem.name,
      description: classItem.description || '',
      schedule: classItem.schedule || '',
      status: classItem.status || 'active'
    };
    setEditingClass(editData);
    setIsModalOpen(true);
  };

  const handleAddClass = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleClassSaved = () => {
    fetchClasses();
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleEnrollmentSaved = () => {
    fetchClasses();
    setIsEnrollmentModalOpen(false);
    setSelectedClass(null);
  };

  const handleViewClassDetail = (classItem: Class) => {
    navigate(`/admin/class/${classItem.id}?tab=classes`);
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      'Đang hoạt động': 'bg-green-100 text-green-800 border-green-200',
      'Đã kết thúc': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const colorClass = status ? statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200' : 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
        {status || 'Không xác định'}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-[#02458b] text-white rounded-t-lg">
          <CardTitle className="text-lg sm:text-xl">Quản lý lớp học</CardTitle>
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
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
              <div>
                <CardTitle className="text-lg sm:text-2xl">Quản lý lớp học</CardTitle>
                <CardDescription className="text-blue-100 mt-1 text-sm">
                  Quản lý tất cả lớp học trong hệ thống
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleAddClass} 
              className="bg-white text-[#02458b] hover:bg-gray-100 border-0 shadow-lg w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Thêm lớp học</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#02458b] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{classes.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Tổng lớp học</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1294fb] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{classes.reduce((total, cls) => total + (cls.enrollments?.length || 0), 0)}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Tổng học viên</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#02458b] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{classes.filter(cls => cls.status === 'Đang hoạt động').length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Đang hoạt động</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ffc418] rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-gray-900" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{new Set(classes.map(cls => cls.course_id)).size}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Khóa học liên kết</div>
                </div>
              </div>
            </div>

            {isMobile ? (
              // Mobile Card Layout
              <div className="space-y-4">
                {classes.map((classItem) => (
                  <Card 
                    key={classItem.id} 
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewClassDetail(classItem)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                              {classItem.name}
                            </h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                                <BookOpen className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs text-gray-600 font-medium">
                                {classItem.course?.name || 'Không xác định'}
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(classItem.status)}
                        </div>
                        
                        {classItem.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {classItem.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <GraduationCap className="h-3 w-3" />
                            <span className="truncate">{classItem.instructor?.fullname || 'Không xác định'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{classItem.enrollments?.length || 0} học viên</span>
                          </div>
                          {classItem.schedule && (
                            <div className="flex items-center space-x-1 col-span-2">
                              <Calendar className="h-3 w-3" />
                              <span className="truncate">{classItem.schedule}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClass(classItem)}
                              className="h-7 px-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingClass(classItem)}
                              className="h-7 px-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button> */}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewClassDetail(classItem)}
                            className="h-7 px-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
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
                        <TableHead className="font-semibold text-gray-700">Tên lớp học</TableHead>
                        <TableHead className="font-semibold text-gray-700">Khóa học</TableHead>
                        <TableHead className="font-semibold text-gray-700">Giảng viên</TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Lịch học</span>
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
                      {classes.map((classItem, index) => (
                        <TableRow 
                          key={classItem.id}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          onClick={() => handleViewClassDetail(classItem)}
                        >
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">{classItem.name}</div>
                              {classItem.description && (
                                <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                                  {classItem.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                                                          <div className="w-8 h-8 bg-[#02458b] rounded-lg flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium text-gray-900">{classItem.course?.name || 'Không xác định'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                                                          <div className="w-8 h-8 bg-[#1294fb] rounded-lg flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium text-gray-900">{classItem.instructor?.fullname || 'Không xác định'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-700">{classItem.schedule || '-'}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-blue-600">{classItem.enrollments?.length || 0}</span>
                              <span className="text-gray-500 text-sm">học viên</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClass(classItem)}
                                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {/* <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeletingClass(classItem)}
                                className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button> */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewClassDetail(classItem)}
                                      className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xem chi tiết</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
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

      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
        }}
        classData={editingClass}
        onSaved={() => {
          fetchClasses();
          setIsModalOpen(false);
          setEditingClass(null);
        }}
      />

      <ClassEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        classData={selectedClass}
        onSaved={handleEnrollmentSaved}
      />

      <AlertDialog open={!!deletingClass} onOpenChange={(open) => !open && setDeletingClass(null)}>
        <AlertDialogContent className="border-0 shadow-xl mx-4 max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl text-gray-800">Xác nhận xóa lớp học</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-sm">
              Bạn có chắc chắn muốn xóa lớp học "{deletingClass?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="hover:bg-gray-100 w-full sm:w-auto">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingClass && handleDeleteClass(deletingClass.id)}
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

export default ClassManagement;
