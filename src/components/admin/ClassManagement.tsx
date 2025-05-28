import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users, UserPlus, Eye } from 'lucide-react';
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
}

const ClassManagement = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
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
          courses!classes_course_id_fkey(name),
          enrollments(
            id,
            student_id,
            enrolled_at,
            profiles!enrollments_student_id_fkey(fullname, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const classesWithDetails = data?.map(classItem => ({
        ...classItem,
        course_name: classItem.courses?.name || 'Không xác định',
        enrolled_count: classItem.enrollments?.length || 0,
        students: classItem.enrollments?.map((enrollment: any) => ({
          id: enrollment.student_id,
          fullname: enrollment.profiles?.fullname || 'Không xác định',
          email: enrollment.profiles?.email || '',
          enrolled_at: enrollment.enrolled_at
        })) || []
      })) || [];

      setClasses(classesWithDetails);
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
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      setClasses(classes.filter(cls => cls.id !== classId));
      toast({
        title: "Thành công",
        description: "Đã xóa lớp học thành công",
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
    setEditingClass(classItem);
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

  const handleViewDetails = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDetailModalOpen(true);
  };

  const handleAddStudent = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEnrollmentModalOpen(true);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quản lý lớp học</CardTitle>
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
              <CardTitle>Quản lý lớp học</CardTitle>
              <CardDescription>
                Quản lý tất cả lớp học trong hệ thống
              </CardDescription>
            </div>
            <Button onClick={handleAddClass} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm lớp học</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên lớp học</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Lịch học</TableHead>
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
              {classes.map((classItem) => (
                <TableRow 
                  key={classItem.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewDetails(classItem)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{classItem.name}</div>
                      {classItem.description && (
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {classItem.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{classItem.course_name}</TableCell>
                  <TableCell>{classItem.schedule || '-'}</TableCell>
                  <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{classItem.enrolled_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClass(classItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddStudent(classItem)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(classItem)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingClass(classItem)}
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

      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classData={editingClass}
        onSaved={handleClassSaved}
      />

      <ClassEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        classData={selectedClass}
        onSaved={handleEnrollmentSaved}
      />

      {/* Class Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết lớp học: {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và danh sách học viên trong lớp
            </DialogDescription>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin lớp học</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Khóa học:</strong> {selectedClass.course_name}</div>
                    <div><strong>Mô tả:</strong> {selectedClass.description || 'Không có'}</div>
                    <div><strong>Lịch học:</strong> {selectedClass.schedule || 'Chưa xác định'}</div>
                    <div><strong>Trạng thái:</strong> {getStatusBadge(selectedClass.status)}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Thống kê</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Số học viên hiện tại:</strong> {selectedClass.enrolled_count}</div>
                    <div><strong>Ngày tạo:</strong> {new Date(selectedClass.created_at).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Danh sách học viên ({selectedClass.enrolled_count})</h3>
                  <Button
                    onClick={() => handleAddStudent(selectedClass)}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Thêm học viên</span>
                  </Button>
                </div>
                
                {selectedClass.students && selectedClass.students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ngày đăng ký</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClass.students.map((student) => (
                        <TableRow key={student.id}>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

export default ClassManagement;
