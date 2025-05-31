
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, ArrowRight, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClassFormModal from './ClassFormModal';
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
  const [editingClass, setEditingClass] = useState<EditClassData | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const { toast } = useToast();

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
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('class_id', classId);

      if (lessonsError) throw lessonsError;

      if (lessons && lessons.length > 0) {
        const { error: deleteLessonsError } = await supabase
          .from('lessons')
          .delete()
          .eq('class_id', classId);

        if (deleteLessonsError) throw deleteLessonsError;
      }

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

  const handleViewClassDetail = (classItem: Class) => {
    navigate(`/admin/class/${classItem.id}?tab=classes`);
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      'Đang hoạt động': 'bg-green-100 text-green-800',
      'Đã kết thúc': 'bg-gray-100 text-gray-800'
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
          <CardTitle>Quản lý lớp học</CardTitle>
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
            <GraduationCap className="h-5 w-5 text-green-600" />
            <CardTitle>Quản lý lớp học</CardTitle>
          </div>
          <Button onClick={handleAddClass}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm lớp học
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{classes.length}</div>
                <div className="text-sm text-gray-600">Tổng lớp học</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{classes.reduce((total, cls) => total + (cls.enrollments?.length || 0), 0)}</div>
                <div className="text-sm text-gray-600">Tổng học viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{classes.filter(cls => cls.status === 'Đang hoạt động').length}</div>
                <div className="text-sm text-gray-600">Đang hoạt động</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{new Set(classes.map(cls => cls.course_id)).size}</div>
                <div className="text-sm text-gray-600">Khóa học liên kết</div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên lớp học</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Giảng viên</TableHead>
                  <TableHead>Lịch học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow 
                    key={classItem.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewClassDetail(classItem)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-semibold">{classItem.name}</div>
                        {classItem.description && (
                          <div className="text-sm text-gray-500 line-clamp-2">{classItem.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        <span>{classItem.course?.name || 'Không xác định'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span>{classItem.instructor?.fullname || 'Không xác định'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{classItem.schedule || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{classItem.enrollments?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => handleEditClass(classItem)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeletingClass(classItem)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewClassDetail(classItem)}>
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

      <AlertDialog open={!!deletingClass} onOpenChange={(open) => !open && setDeletingClass(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lớp học "{deletingClass?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingClass && handleDeleteClass(deletingClass.id)}
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

export default ClassManagement;
