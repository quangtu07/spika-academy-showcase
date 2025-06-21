import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ArrowLeft, FileText, Calendar, User, Eye, Edit, Trash2, Download, Upload, Type, Image, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TeacherToolbar from '@/components/teacher/TeacherToolbar';
import NotificationBell from '@/components/teacher/NotificationBell';

interface Assignment {
  id: string;
  content: {
    blocks: Array<{
      type: 'text' | 'image' | 'video';
      content: string;
      metadata?: {
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
      };
    }>;
  };
  created_at: string;
  instructor: {
    fullname: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  lesson_number: number;
  class: {
    id: string;
    name: string;
  };
}

interface AssignmentSubmission {
  id: string;
  status: 'Chưa làm' | 'Đang chờ chấm' | 'Đã hoàn thành';
  submitted_at: string | null;
  student: {
    fullname: string;
    email: string;
  };
}

interface SubmissionStats {
  chuaLam: number;
  dangChoChams: number;
  daHoanThanh: number;
}

interface StudentNotSubmitted {
  id: string;
  fullname: string;
  email: string;
}

const LessonAssignmentsPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [submissionStats, setSubmissionStats] = useState<{ [assignmentId: string]: SubmissionStats }>({});
  const [loading, setLoading] = useState(true);
  
  // New states for edit/delete functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [editingBlocks, setEditingBlocks] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBlocks, setUploadingBlocks] = useState<Set<string>>(new Set());
  const [teacherId, setTeacherId] = useState<string | null>(null);
  
  // New states for showing students who haven't submitted
  const [showNotSubmittedModal, setShowNotSubmittedModal] = useState(false);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState<StudentNotSubmitted[]>([]);
  const [selectedAssignmentForNotSubmitted, setSelectedAssignmentForNotSubmitted] = useState<Assignment | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (lessonId) {
      fetchLessonInfo();
      fetchAssignments();
    }
  }, [lessonId]);

  useEffect(() => {
    if (assignments.length > 0 && lesson) {
      fetchSubmissionStats();
    }
  }, [assignments, lesson]);

  useEffect(() => {
    // Get teacherId from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setTeacherId(currentUser?.id || null);
    }
  }, []);

  const fetchLessonInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          lesson_number,
          classes (
            id,
            name
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      setLesson({
        id: data.id,
        title: data.title,
        lesson_number: data.lesson_number,
        class: {
          id: data.classes?.id || '',
          name: data.classes?.name || 'Không xác định'
        }
      });
    } catch (error) {
      console.error('Error fetching lesson info:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin buổi học",
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assignments')
        .select(`
          id,
          content,
          created_at,
          instructor:profiles (
            fullname
          )
        `)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAssignments = data?.map((assignment: any) => ({
        id: assignment.id,
        content: assignment.content,
        created_at: assignment.created_at,
        instructor: assignment.instructor || { fullname: 'Không xác định' }
      })) || [];

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài tập",
        variant: "destructive",
      });
    }
  };

  const fetchSubmissionStats = async () => {
    try {
      if (!lesson?.class?.id || assignments.length === 0) return;

      const assignmentIds = assignments.map(a => a.id);

      // Get all enrolled students in this class
      const { data: enrolledStudents, error: enrollError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', lesson.class.id)
        .eq('status', 'active');

      if (enrollError) throw enrollError;

      const enrolledStudentIds = enrolledStudents?.map(e => e.student_id) || [];

      // Get all submissions for these assignments
      const { data: submissions, error: submissionError } = await supabase
        .from('assignment_submissions')
        .select('assignment_id, student_id, status')
        .in('assignment_id', assignmentIds);

      if (submissionError) throw submissionError;

      // Calculate stats for each assignment
      const stats: { [assignmentId: string]: SubmissionStats } = {};

      assignments.forEach(assignment => {
        const assignmentSubmissions = submissions?.filter(s => s.assignment_id === assignment.id) || [];
        
        const submittedStudentIds = assignmentSubmissions.map(s => s.student_id);
        const chuaLamCount = enrolledStudentIds.filter(studentId => !submittedStudentIds.includes(studentId)).length;
        
        const dangChoChamsCount = assignmentSubmissions.filter(s => s.status === 'Đang chờ chấm').length;
        const daHoanThanhCount = assignmentSubmissions.filter(s => s.status === 'Đã hoàn thành').length;

        stats[assignment.id] = {
          chuaLam: chuaLamCount,
          dangChoChams: dangChoChamsCount,
          daHoanThanh: daHoanThanhCount
        };
      });

      setSubmissionStats(stats);
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thống kê bài nộp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotSubmittedStudents = async (assignment: Assignment) => {
    try {
      if (!lesson?.class?.id) return;

      // Get all enrolled students
      const { data: enrolledStudents, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          profiles!enrollments_student_id_fkey (
            id,
            fullname,
            email
          )
        `)
        .eq('class_id', lesson.class.id)
        .eq('status', 'active');

      if (enrollError) throw enrollError;

      // Get students who have submitted this assignment
      const { data: submissions, error: submissionError } = await supabase
        .from('assignment_submissions')
        .select('student_id')
        .eq('assignment_id', assignment.id);

      if (submissionError) throw submissionError;

      const submittedStudentIds = submissions?.map(s => s.student_id) || [];

      // Filter out students who have already submitted
      const notSubmitted = enrolledStudents
        ?.filter(enrollment => !submittedStudentIds.includes(enrollment.student_id))
        ?.map(enrollment => ({
          id: enrollment.profiles?.id || '',
          fullname: enrollment.profiles?.fullname || 'Không xác định',
          email: enrollment.profiles?.email || 'Không xác định'
        })) || [];

      setNotSubmittedStudents(notSubmitted);
      setSelectedAssignmentForNotSubmitted(assignment);
      setShowNotSubmittedModal(true);
    } catch (error) {
      console.error('Error fetching not submitted students:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học viên chưa nộp bài",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Chưa làm': { text: 'Chưa làm', class: 'bg-amber-500/15 text-amber-700 border-amber-300' },
      'Đang chờ chấm': { text: 'Đang chờ chấm', class: 'bg-blue-500/15 text-blue-700 border-blue-300' },
      'Đã hoàn thành': { text: 'Đã hoàn thành', class: 'bg-emerald-500/15 text-emerald-700 border-emerald-300' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || 
      { text: 'Không xác định', class: 'bg-gray-500/15 text-gray-700 border-gray-300' };

    return (
      <Badge className={`${statusInfo.class} border font-medium px-3 py-1`}>
        {statusInfo.text}
      </Badge>
    );
  };

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-gray-700 whitespace-pre-wrap">{block.content}</p>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border">
              <img 
                src={block.content} 
                alt="Assignment image"
                className="max-w-full h-auto rounded border"
              />
            </div>
          </div>
        );
      case 'video':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border">
              <video 
                src={block.content} 
                controls
                className="max-w-full h-auto rounded border"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSortedContentBlocks = (blocks: any[]) => {
    const sortedBlocks = [...blocks].sort((a, b) => {
      const typePriority = { 'text': 1, 'image': 2, 'video': 3 };
      return typePriority[a.type as keyof typeof typePriority] - typePriority[b.type as keyof typeof typePriority];
    });

    return sortedBlocks.map((block, index) => renderContentBlock(block, index));
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setEditingBlocks(assignment.content.blocks.map((block, index) => ({ 
      ...block, 
      id: `block-${index}` 
    })));
    setShowEditModal(true);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      const { error } = await (supabase as any)
        .from('assignments')
        .delete()
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
      
      toast({
        title: "Thành công",
        description: "Đã xóa bài tập thành công",
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedAssignment(null);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTextBlock = () => {
    const newBlock = {
      id: generateId(),
      type: 'text' as const,
      content: '',
    };
    setEditingBlocks([...editingBlocks, newBlock]);
  };

  const addImageBlock = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFile(file, 'image');
      }
    };
    input.click();
  };

  const addVideoBlock = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFile(file, 'video');
      }
    };
    input.click();
  };

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    const blockId = generateId();
    
    const newBlock = {
      id: blockId,
      type,
      content: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    };
    
    setEditingBlocks(prev => [...prev, newBlock]);
    setUploadingBlocks(prev => new Set([...prev, blockId]));

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('assignment-teacher-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assignment-teacher-files')
        .getPublicUrl(filePath);

      setEditingBlocks(prev => prev.map(block => 
        block.id === blockId 
          ? { ...block, content: publicUrl }
          : block
      ));

      toast({
        title: "Thành công",
        description: `${type === 'image' ? 'Hình ảnh' : 'Video'} đã được tải lên thành công`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên file. Vui lòng thử lại.",
        variant: "destructive",
      });
      
      setEditingBlocks(prev => prev.filter(block => block.id !== blockId));
    } finally {
      setUploadingBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
    }
  };

  const updateBlockContent = (blockId: string, content: string) => {
    setEditingBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setEditingBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const saveEditedAssignment = async () => {
    if (!selectedAssignment || editingBlocks.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một nội dung cho bài tập",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const assignmentContent = {
        blocks: editingBlocks.map(({ id, ...block }) => block),
      };

      const { error } = await (supabase as any)
        .from('assignments')
        .update({ content: assignmentContent })
        .eq('id', selectedAssignment.id);

      if (error) throw error;

      setAssignments(assignments.map(a => 
        a.id === selectedAssignment.id 
          ? { ...a, content: assignmentContent }
          : a
      ));

      toast({
        title: "Thành công",
        description: "Đã cập nhật bài tập thành công",
      });

      setShowEditModal(false);
      setSelectedAssignment(null);
      setEditingBlocks([]);
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEditBlock = (block: any) => {
    const isUploading = uploadingBlocks.has(block.id);

    return (
      <Card key={block.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              {block.type === 'text' && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Type className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Văn bản</span>
                  </div>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    placeholder="Nhập nội dung văn bản..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              {block.type === 'image' && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Image className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Hình ảnh</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                      <span className="text-sm text-gray-600">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-2">
                      <img 
                        src={block.content} 
                        alt={block.metadata?.fileName}
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-500">{block.metadata?.fileName}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <span className="text-sm text-gray-500">Đang xử lý hình ảnh...</span>
                    </div>
                  )}
                </div>
              )}
              
              {block.type === 'video' && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Video</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                      <span className="text-sm text-gray-600">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-2">
                      <video 
                        src={block.content} 
                        controls
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-500">{block.metadata?.fileName}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <span className="text-sm text-gray-500">Đang xử lý video...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBlock(block.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              disabled={isUploading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleViewSubmissions = (assignment: Assignment, status: string) => {
    if (status === 'Chưa làm') {
      fetchNotSubmittedStudents(assignment);
    } else {
      const statusParam = status === 'Đang chờ chấm' ? 'dang-cho-cham' : 'da-hoan-thanh';
      navigate(`/teacher/assignment/${assignment.id}/submissions/${statusParam}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải danh sách bài tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <TeacherToolbar 
        title="Bài tập đã giao"
        subtitle={lesson ? `Buổi ${lesson.lesson_number}: ${lesson.title} - ${lesson.class.name}` : undefined}
        rightContent={<NotificationBell teacherId={teacherId} />}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Assignments List */}
          {assignments.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-500" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có bài tập nào</h4>
                <p className="text-gray-500 mb-8 text-lg">Buổi học này chưa có bài tập nào được giao.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const stats = submissionStats[assignment.id] || { chuaLam: 0, dangChoChams: 0, daHoanThanh: 0 };
                
                return (
                  <Card key={assignment.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-[#02458b]/5 border-b border-[#02458b]/20">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-[#02458b]" />
                            <span>Bài tập</span>
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-3 mt-2">
                            <User className="w-4 h-4" />
                            <span>Giảng viên: {assignment.instructor.fullname}</span>
                            <Calendar className="w-4 h-4 ml-4" />
                            <span>Giao ngày: {new Date(assignment.created_at).toLocaleDateString('vi-VN')}</span>
                          </CardDescription>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAssignment(assignment)}
                            className="bg-[#02458b]/5 border-[#02458b]/30 text-[#02458b] hover:bg-[#02458b]/10 p-2"
                            title="Chỉnh sửa bài tập"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAssignment(assignment)}
                            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 p-2"
                            title="Xóa bài tập"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Assignment Content */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Nội dung bài tập</h4>
                          <div className="bg-[#02458b]/5 rounded-xl p-6 border border-[#02458b]/20">
                            {renderSortedContentBlocks(assignment.content.blocks)}
                          </div>
                        </div>

                        {/* Submissions Summary */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan bài nộp</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                              onClick={() => handleViewSubmissions(assignment, 'Chưa làm')}
                              className="bg-amber-50 rounded-lg p-4 border border-amber-200 hover:bg-amber-100 transition-colors text-left w-full"
                            >
                              <div className="flex items-center space-x-3">
                                <Upload className="w-5 h-5 text-amber-600" />
                                <div>
                                  <p className="text-amber-900 font-semibold">Chưa làm</p>
                                  <p className="text-amber-700 text-2xl font-bold">
                                    {stats.chuaLam}
                                  </p>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => handleViewSubmissions(assignment, 'Đang chờ chấm')}
                              className="bg-[#02458b]/5 rounded-lg p-4 border border-[#02458b]/20 hover:bg-[#02458b]/10 transition-colors text-left w-full"
                            >
                              <div className="flex items-center space-x-3">
                                <Eye className="w-5 h-5 text-[#02458b]" />
                                <div>
                                  <p className="text-[#02458b] font-semibold">Đang chờ chấm</p>
                                  <p className="text-[#02458b] text-2xl font-bold">
                                    {stats.dangChoChams}
                                  </p>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => handleViewSubmissions(assignment, 'Đã hoàn thành')}
                              className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 hover:bg-emerald-100 transition-colors text-left w-full"
                            >
                              <div className="flex items-center space-x-3">
                                <Download className="w-5 h-5 text-emerald-600" />
                                <div>
                                  <p className="text-emerald-900 font-semibold">Đã hoàn thành</p>
                                  <p className="text-emerald-700 text-2xl font-bold">
                                    {stats.daHoanThanh}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Assignment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#02458b]">
              Chỉnh sửa bài tập
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add Content Buttons */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Nội dung bài tập</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTextBlock}
                  className="flex items-center space-x-2"
                >
                  <Type className="w-4 h-4" />
                  <span>Thêm văn bản</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageBlock}
                  className="flex items-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Thêm hình ảnh</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addVideoBlock}
                  className="flex items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Thêm video</span>
                </Button>
              </div>

              {/* Content Blocks */}
              <div>
                {editingBlocks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có nội dung nào. Hãy thêm văn bản, hình ảnh hoặc video.</p>
                  </div>
                ) : (
                  editingBlocks.map(renderEditBlock)
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={saveEditedAssignment}
                disabled={isSubmitting || uploadingBlocks.size > 0}
                className="bg-[#02458b] hover:bg-[#02458b]/90"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật bài tập'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <span>Xác nhận xóa bài tập</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài tập này không? Hành động này không thể hoàn tác và sẽ xóa tất cả bài nộp liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAssignment}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Xóa bài tập
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Students Not Submitted Modal */}
      <Dialog open={showNotSubmittedModal} onOpenChange={setShowNotSubmittedModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-700 flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Học viên chưa làm bài tập</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {notSubmittedStudents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tất cả học viên đã nộp bài</h3>
                <p className="text-gray-600">Không có học viên nào chưa làm bài tập này.</p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium">
                    Có {notSubmittedStudents.length} học viên chưa nộp bài tập này
                  </p>
                </div>
                
                <div className="space-y-3">
                  {notSubmittedStudents.map((student) => (
                    <Card key={student.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{student.fullname}</h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                            Chưa nộp
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
            
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={() => setShowNotSubmittedModal(false)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonAssignmentsPage;
