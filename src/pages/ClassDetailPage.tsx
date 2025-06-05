import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ArrowLeft, Users, BookOpen, UserPlus, Trash2, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface Student {
  id: string;
  fullname: string;
  email: string;
}

const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{id: string, name: string} | null>(null);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{id: string, title: string, content: string | null, lesson_number: number} | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonContent, setEditLessonContent] = useState('');
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isDeleteLessonDialogOpen, setIsDeleteLessonDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<{id: string, title: string, lesson_number: number} | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const { toast } = useToast();

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      // Fetch class details with course
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          *,
          course:courses!inner (
            id,
            name,
            description
          )
        `)
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      if (!classData) {
        throw new Error('Không tìm thấy thông tin lớp học');
      }

      console.log('🔍 Dữ liệu thô từ database (classes):', classData);

      // Cast to proper type that includes instructor_id
      const classRecord = classData as any;

      // Fetch instructor separately
      let instructorData = null;
      if (classRecord.instructor_id) {
        const { data: instructor, error: instructorError } = await supabase
          .from('profiles')
          .select('id, fullname, email')
          .eq('id', classRecord.instructor_id)
          .single();

        if (instructorError) {
          console.error('Error fetching instructor:', instructorError);
        } else {
          instructorData = instructor;
        }
      }

      console.log('👨‍🏫 Dữ liệu instructor:', instructorData);

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
        id: classRecord.id,
        name: classRecord.name,
        description: classRecord.description,
        schedule: classRecord.schedule,
        status: classRecord.status,
        created_at: classRecord.created_at,
        updated_at: classRecord.updated_at,
        instructor_id: classRecord.instructor_id,
        course_id: classRecord.course_id,
        course: classRecord.course,
        instructor: instructorData,
        enrollments: enrollmentsData || [],
        lessons: lessonsData || []
      };

      setClassData(transformedData);
      console.log('📊 Dữ liệu lớp học đã được transform:', {
        id: transformedData.id,
        name: transformedData.name,
        status: transformedData.status,
        statusType: typeof transformedData.status,
        course: transformedData.course?.name,
        instructor_id: transformedData.instructor_id,
        instructor: transformedData.instructor?.fullname,
        enrollmentsCount: transformedData.enrollments?.length,
        lessonsCount: transformedData.lessons?.length
      });
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

  const fetchAvailableStudents = async () => {
    try {
      // Lấy danh sách học viên chưa đăng ký lớp này
      const { data: allStudents, error: studentsError } = await supabase
        .from('profiles')
        .select('id, fullname, email')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Lấy danh sách học viên đã đăng ký lớp này
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', classId);

      if (enrolledError) throw enrolledError;

      // Lọc ra những học viên chưa đăng ký
      const enrolledStudentIds = enrolledStudents?.map(e => e.student_id) || [];
      const available = allStudents?.filter(student => 
        !enrolledStudentIds.includes(student.id)
      ) || [];

      setAvailableStudents(available);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học viên",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn học viên",
        variant: "destructive",
      });
      return;
    }

    setIsAddingStudent(true);
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert([
          {
            class_id: classId,
            student_id: selectedStudentId,
            enrolled_at: new Date().toISOString(),
            status: 'active'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã thêm học viên vào lớp học",
      });

      // Đóng modal và reset form
      handleCloseAddStudentModal();
      
      // Reload dữ liệu lớp học
      await fetchClassDetails();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm học viên vào lớp học",
        variant: "destructive",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleOpenAddStudentModal = () => {
    setIsAddStudentModalOpen(true);
    fetchAvailableStudents();
  };

  const handleCloseAddStudentModal = () => {
    setIsAddStudentModalOpen(false);
    setSelectedStudentId('');
  };

  const handleRemoveStudentClick = (enrollmentId: string, studentName: string) => {
    setStudentToRemove({ id: enrollmentId, name: studentName });
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    setIsRemovingStudent(true);
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', studentToRemove.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã xóa học viên ${studentToRemove.name} khỏi lớp học`,
      });

      // Đóng dialog và reset
      setIsRemoveDialogOpen(false);
      setStudentToRemove(null);
      
      // Reload dữ liệu lớp học
      await fetchClassDetails();
    } catch (error: any) {
      console.error('Error removing student:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa học viên khỏi lớp học",
        variant: "destructive",
      });
    } finally {
      setIsRemovingStudent(false);
    }
  };

  const handleCancelRemove = () => {
    setIsRemoveDialogOpen(false);
    setStudentToRemove(null);
  };

  const getNextLessonNumber = () => {
    if (!classData?.lessons || classData.lessons.length === 0) {
      return 1;
    }
    const maxLessonNumber = Math.max(...classData.lessons.map(lesson => lesson.lesson_number));
    return maxLessonNumber + 1;
  };

  const handleOpenAddLessonModal = () => {
    setIsAddLessonModalOpen(true);
  };

  const handleCloseAddLessonModal = () => {
    setIsAddLessonModalOpen(false);
    setLessonTitle('');
    setLessonContent('');
  };

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề buổi học",
        variant: "destructive",
      });
      return;
    }

    setIsAddingLesson(true);
    try {
      const nextLessonNumber = getNextLessonNumber();
      
      const { error } = await supabase
        .from('lessons')
        .insert([
          {
            class_id: classId,
            title: lessonTitle.trim(),
            content: lessonContent.trim() || null,
            lesson_number: nextLessonNumber,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã thêm buổi học ${nextLessonNumber}: ${lessonTitle}`,
      });

      // Đóng modal và reset form
      handleCloseAddLessonModal();
      
      // Reload dữ liệu lớp học
      await fetchClassDetails();
    } catch (error: any) {
      console.error('Error adding lesson:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm buổi học",
        variant: "destructive",
      });
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleOpenEditLessonModal = (lesson: any) => {
    setEditingLesson(lesson);
    setEditLessonTitle(lesson.title);
    setEditLessonContent(lesson.content || '');
    setIsEditLessonModalOpen(true);
  };

  const handleCloseEditLessonModal = () => {
    setIsEditLessonModalOpen(false);
    setEditingLesson(null);
    setEditLessonTitle('');
    setEditLessonContent('');
  };

  const handleEditLesson = async () => {
    if (!editLessonTitle.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề buổi học",
        variant: "destructive",
      });
      return;
    }

    if (!editingLesson) return;

    setIsEditingLesson(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: editLessonTitle.trim(),
          content: editLessonContent.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingLesson.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã cập nhật buổi học ${editingLesson.lesson_number}: ${editLessonTitle}`,
      });

      // Đóng modal và reset form
      handleCloseEditLessonModal();
      
      // Reload dữ liệu lớp học
      await fetchClassDetails();
    } catch (error: any) {
      console.error('Error editing lesson:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật buổi học",
        variant: "destructive",
      });
    } finally {
      setIsEditingLesson(false);
    }
  };

  const handleDeleteLessonClick = (lesson: any) => {
    setLessonToDelete({
      id: lesson.id,
      title: lesson.title,
      lesson_number: lesson.lesson_number
    });
    setIsDeleteLessonDialogOpen(true);
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;

    setIsDeletingLesson(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonToDelete.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã xóa buổi học ${lessonToDelete.lesson_number}: ${lessonToDelete.title}`,
      });

      // Đóng dialog và reset
      setIsDeleteLessonDialogOpen(false);
      setLessonToDelete(null);
      
      // Reload dữ liệu lớp học
      await fetchClassDetails();
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa buổi học",
        variant: "destructive",
      });
    } finally {
      setIsDeletingLesson(false);
    }
  };

  const handleCancelDeleteLesson = () => {
    setIsDeleteLessonDialogOpen(false);
    setLessonToDelete(null);
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
    // Debug để kiểm tra status từ database
    console.log('Status từ database:', status, typeof status);
    
    const statusMap = {
      // Giá trị tiếng Việt từ database
      'đang hoạt động': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800 border-green-200' },
      'đã kết thúc': { text: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800 border-gray-200' },
      'hoàn thành': { text: 'Hoàn thành', class: 'bg-blue-100 text-blue-800 border-blue-200' },
      'chờ bắt đầu': { text: 'Chờ bắt đầu', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'đã hủy': { text: 'Đã hủy', class: 'bg-red-100 text-red-800 border-red-200' },
      
      // Giá trị tiếng Anh backup (phòng trường hợp)
      'active': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800 border-green-200' },
      'inactive': { text: 'Không hoạt động', class: 'bg-gray-100 text-gray-800 border-gray-200' },
      'completed': { text: 'Đã hoàn thành', class: 'bg-blue-100 text-blue-800 border-blue-200' },
      'pending': { text: 'Chờ bắt đầu', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'cancelled': { text: 'Đã hủy', class: 'bg-red-100 text-red-800 border-red-200' }
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-100 text-gray-800 border-gray-200' };
    
    // Normalize status (trim và lowercase để so sánh chính xác)
    const normalizedStatus = status?.toString().trim().toLowerCase();
    console.log('Normalized status:', normalizedStatus);
    
    let statusInfo = defaultStatus;
    if (normalizedStatus && statusMap[normalizedStatus as keyof typeof statusMap]) {
      statusInfo = statusMap[normalizedStatus as keyof typeof statusMap];
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${statusInfo.class}`}>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-indigo-50/50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center space-x-2 bg-white/50 backdrop-blur-xl hover:bg-white/80 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại</span>
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {classData.name}
                  </h1>
                  <p className="text-sm text-gray-600">Chi tiết lớp học</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={handleOpenAddStudentModal} 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 flex items-center justify-center space-x-2 text-sm px-4 py-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Thêm học viên</span>
                </Button>
                <Button 
                  onClick={handleOpenAddLessonModal} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 flex items-center justify-center space-x-2 text-sm px-4 py-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm buổi học</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Class Info Card */}
          <Card className="mb-6 border-0 shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <CardTitle className="text-xl flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Thông tin lớp học</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-purple-700 min-w-[140px]">Khóa học:</span>
                      <span className="text-gray-700">{classData.course?.name || 'Không xác định'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-purple-700 min-w-[140px]">Giảng viên:</span>
                      <span className="text-gray-700">{classData.instructor?.fullname || 'Không xác định'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-purple-700 min-w-[140px]">Email giảng viên:</span>
                      <span className="text-gray-700">{classData.instructor?.email || 'Không xác định'}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-purple-700 min-w-[140px]">Mô tả khóa học:</span>
                      <span className="text-gray-700">{classData.course?.description || 'Không có'}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold text-purple-700 min-w-[140px]">Mô tả lớp học:</span>
                      <span className="text-gray-700">{classData.description || 'Không có'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-purple-700 min-w-[140px]">Lịch học:</span>
                      <span className="text-gray-700">{classData.schedule || 'Chưa xác định'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-blue-700 min-w-[140px]">Trạng thái:</span>
                      <span>{getStatusBadge(classData.status)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-blue-700 min-w-[140px]">Số học viên:</span>
                      <span className="text-gray-700">{classData.enrollments?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-blue-700 min-w-[140px]">Số buổi học:</span>
                      <span className="text-gray-700">{classData.lessons?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-blue-700 min-w-[140px]">Ngày tạo:</span>
                      <span className="text-gray-700">{new Date(classData.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-blue-700 min-w-[140px]">Lần cập nhật cuối:</span>
                      <span className="text-gray-700">
                        {classData.updated_at ? new Date(classData.updated_at).toLocaleString('vi-VN') : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Danh sách học viên ({classData.enrollments?.length || 0})</span>
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Tất cả học viên đã đăng ký lớp học này
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {classData.enrollments && classData.enrollments.length > 0 ? (
                    <div className="rounded-xl overflow-hidden border border-gray-100">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50/50">
                            <TableRow>
                              <TableHead className="font-semibold">STT</TableHead>
                              <TableHead className="font-semibold">Họ tên</TableHead>
                              <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
                              <TableHead className="font-semibold hidden sm:table-cell">Ngày đăng ký</TableHead>
                              <TableHead className="text-center font-semibold">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classData.enrollments.map((enrollment, index) => (
                              <TableRow key={enrollment.id} className="hover:bg-gray-50/50">
                                <TableCell className="text-center sm:text-left">{index + 1}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{enrollment.student?.fullname || 'Không xác định'}</div>
                                    <div className="text-sm text-gray-500 sm:hidden">{enrollment.student?.email}</div>
                                    <div className="text-xs text-gray-400 sm:hidden">
                                      {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{enrollment.student?.email || ''}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell className="text-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRemoveStudentClick(enrollment.id, enrollment.student?.fullname || 'Học viên')}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Xóa học viên khỏi lớp học</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900">Chưa có học viên</p>
                      <p className="text-sm text-gray-600 mt-1">Chưa có học viên nào đăng ký lớp này</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lessons">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Danh sách buổi học ({classData.lessons?.length || 0})</span>
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Tất cả buổi học trong lớp
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {classData.lessons && classData.lessons.length > 0 ? (
                    <div className="rounded-xl overflow-hidden border border-gray-100">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50/50">
                            <TableRow>
                              <TableHead className="font-semibold">Buổi học</TableHead>
                              <TableHead className="font-semibold">Tiêu đề</TableHead>
                              <TableHead className="font-semibold hidden sm:table-cell">Nội dung</TableHead>
                              <TableHead className="font-semibold hidden sm:table-cell">Ngày tạo</TableHead>
                              <TableHead className="font-semibold hidden sm:table-cell">Cập nhật lần cuối</TableHead>
                              <TableHead className="text-center font-semibold">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classData.lessons.map((lesson) => (
                              <TableRow key={lesson.id} className="hover:bg-gray-50/50">
                                <TableCell className="font-medium whitespace-nowrap">Buổi {lesson.lesson_number}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{lesson.title}</div>
                                    <div className="text-sm text-gray-500 sm:hidden line-clamp-2">{lesson.content || '-'}</div>
                                    <div className="text-xs text-gray-400 sm:hidden">
                                      Tạo: {new Date(lesson.created_at).toLocaleString('vi-VN')}
                                      {lesson.updated_at && (
                                        <><br />Cập nhật: {new Date(lesson.updated_at).toLocaleString('vi-VN')}</>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{lesson.content || '-'}</TableCell>
                                <TableCell className="hidden sm:table-cell whitespace-nowrap">
                                  {new Date(lesson.created_at).toLocaleString('vi-VN')}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell whitespace-nowrap">
                                  {lesson.updated_at ? new Date(lesson.updated_at).toLocaleString('vi-VN') : '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEditLessonModal(lesson)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Chỉnh sửa buổi học</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteLessonClick(lesson)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Xóa buổi học</p>
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
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900">Chưa có buổi học</p>
                      <p className="text-sm text-gray-600 mt-1">Chưa có buổi học nào được tạo cho lớp này</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Student Modal */}
      <Dialog open={isAddStudentModalOpen} onOpenChange={handleCloseAddStudentModal}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle>Thêm học viên vào lớp học</DialogTitle>
            <DialogDescription className="text-gray-500">
              Chọn học viên từ danh sách bên dưới để thêm vào lớp học
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {availableStudents.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-select">Học viên</Label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn học viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.fullname} - {student.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Không có học viên nào để thêm</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddStudent} 
              disabled={isAddingStudent || availableStudents.length === 0 || !selectedStudentId}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              {isAddingStudent ? 'Đang thêm...' : 'Thêm học viên'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Student Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={handleCancelRemove}>
        <AlertDialogContent className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
          <AlertDialogHeader className="border-b bg-gradient-to-r from-red-500 to-pink-500 text-white p-6">
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <span>Xác nhận xóa học viên</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-red-100">
              Bạn có chắc chắn muốn xóa học viên <strong className="text-white">{studentToRemove?.name}</strong> khỏi lớp học này?
              <br />
              <span className="text-red-200 mt-2 block">
                Thao tác này không thể hoàn tác.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-6">
            <AlertDialogCancel 
              disabled={isRemovingStudent}
              className="bg-gray-100 hover:bg-gray-200 border-0"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveStudent}
              disabled={isRemovingStudent}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0"
            >
              {isRemovingStudent ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Lesson Modal */}
      <Dialog open={isAddLessonModalOpen} onOpenChange={handleCloseAddLessonModal}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle>Thêm buổi học</DialogTitle>
            <DialogDescription className="text-gray-500">
              Nhập thông tin cho buổi học mới (Buổi học số {getNextLessonNumber()})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Tiêu đề</Label>
              <Input 
                id="lesson-title" 
                value={lessonTitle} 
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Nhập tiêu đề buổi học"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-content">Nội dung</Label>
              <Textarea 
                id="lesson-content" 
                value={lessonContent} 
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Nhập nội dung buổi học (tùy chọn)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddLesson} 
              disabled={isAddingLesson || !lessonTitle.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
            >
              {isAddingLesson ? 'Đang thêm...' : 'Thêm buổi học'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Modal */}
      <Dialog open={isEditLessonModalOpen} onOpenChange={handleCloseEditLessonModal}>
        <DialogContent className="sm:max-w-[425px] bg-white/80 backdrop-blur-xl border-0 shadow-xl">
          <DialogHeader className="border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Chỉnh sửa buổi học</span>
            </DialogTitle>
            <DialogDescription className="text-purple-100">
              Nhập thông tin cho buổi học đã chọn
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lesson-title" className="text-right font-medium">
                  Tiêu đề
                </Label>
                <Input 
                  id="edit-lesson-title" 
                  value={editLessonTitle} 
                  onChange={(e) => setEditLessonTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="Nhập tiêu đề buổi học"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-lesson-content" className="text-right font-medium">
                  Nội dung
                </Label>
                <Textarea 
                  id="edit-lesson-content" 
                  value={editLessonContent} 
                  onChange={(e) => setEditLessonContent(e.target.value)}
                  className="col-span-3 min-h-[100px]"
                  placeholder="Nhập nội dung buổi học"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-gray-50">
            <Button 
              onClick={handleEditLesson} 
              disabled={isEditingLesson || !editLessonTitle.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              {isEditingLesson ? 'Đang cập nhật...' : 'Cập nhật buổi học'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Lesson Dialog */}
      <AlertDialog open={isDeleteLessonDialogOpen} onOpenChange={handleCancelDeleteLesson}>
        <AlertDialogContent className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
          <AlertDialogHeader className="border-b bg-gradient-to-r from-red-500 to-pink-500 text-white p-6">
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <span>Xác nhận xóa buổi học</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-red-100">
              Bạn có chắc chắn muốn xóa buổi học <strong className="text-white">{lessonToDelete?.title}</strong> khỏi lớp học này?
              <br />
              <span className="text-red-200 mt-2 block">
                Thao tác này không thể hoàn tác.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-6">
            <AlertDialogCancel 
              disabled={isDeletingLesson}
              className="bg-gray-100 hover:bg-gray-200 border-0"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLesson}
              disabled={isDeletingLesson}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0"
            >
              {isDeletingLesson ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClassDetailPage;
