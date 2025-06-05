import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, FileText, Calendar, User, BookOpen, GraduationCap, Type, Image, Video, Upload, Trash2, Send, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubmissionBlock {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

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

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: any;
  status: 'Chưa làm' | 'Đang chờ chấm' | 'Đã hoàn thành';
  submitted_at: string | null;
}

interface Lesson {
  id: string;
  title: string;
  lesson_number: number;
  class: {
    name: string;
  };
}

const StudentLessonAssignmentsPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [submissionBlocks, setSubmissionBlocks] = useState<SubmissionBlock[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBlocks, setUploadingBlocks] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchSubmissions = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) return;

      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser || !currentUser.id) return;

      const { data, error } = await (supabase as any)
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', currentUser.id);

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchLessonInfo();
      fetchAssignments();
      fetchSubmissions();
    }
  }, [lessonId]);

  const fetchLessonInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          lesson_number,
          classes (
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
        class: data.classes || { name: 'Không xác định' }
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
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTextBlock = () => {
    const newBlock: SubmissionBlock = {
      id: generateId(),
      type: 'text',
      content: '',
    };
    setSubmissionBlocks([...submissionBlocks, newBlock]);
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
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để tải lên file",
        variant: "destructive",
      });
      return;
    }

    const currentUser = JSON.parse(currentUserStr);
    const blockId = generateId();
    
    const newBlock: SubmissionBlock = {
      id: blockId,
      type,
      content: '',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    };
    
    setSubmissionBlocks(prev => [...prev, newBlock]);
    setUploadingBlocks(prev => new Set([...prev, blockId]));

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${selectedAssignmentId}/${currentUser.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assignment-student-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assignment-student-files')
        .getPublicUrl(filePath);

      setSubmissionBlocks(prev => prev.map(block => 
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
      
      setSubmissionBlocks(prev => prev.filter(block => block.id !== blockId));
    } finally {
      setUploadingBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
    }
  };

  const updateBlockContent = (blockId: string, content: string) => {
    setSubmissionBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  };

  const removeBlock = (blockId: string) => {
    setSubmissionBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleSubmitAssignment = async () => {
    if (submissionBlocks.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất một nội dung cho bài nộp",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUserStr = localStorage.getItem('currentUser');
      
      if (!currentUserStr) {
        throw new Error('Bạn cần đăng nhập để thực hiện chức năng này');
      }

      const currentUser = JSON.parse(currentUserStr);
      
      if (!currentUser || !currentUser.id) {
        throw new Error('Thông tin người dùng không hợp lệ');
      }

      const submissionContent = {
        blocks: submissionBlocks.map(({ id, ...block }) => block),
      };

      // Kiểm tra xem đã có submission record chưa
      const { data: existingSubmission, error: checkError } = await (supabase as any)
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', selectedAssignmentId)
        .eq('student_id', currentUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected if no submission exists
        throw checkError;
      }

      let result;
      if (existingSubmission) {
        // Update existing submission
        result = await (supabase as any)
          .from('assignment_submissions')
          .update({
            content: submissionContent,
            status: 'Đang chờ chấm',
            submitted_at: new Date().toISOString(),
          })
          .eq('assignment_id', selectedAssignmentId)
          .eq('student_id', currentUser.id);
      } else {
        // Create new submission
        result = await (supabase as any)
          .from('assignment_submissions')
          .insert({
            assignment_id: selectedAssignmentId,
            student_id: currentUser.id,
            content: submissionContent,
            status: 'Đang chờ chấm',
            submitted_at: new Date().toISOString(),
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Thành công",
        description: "Bài tập đã được nộp thành công",
      });

      setShowSubmissionModal(false);
      setSubmissionBlocks([]);
      setSelectedAssignmentId('');
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể nộp bài tập. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSubmissionModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setSubmissionBlocks([]);
    setShowSubmissionModal(true);
  };

  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  };

  const renderSubmissionBlock = (block: SubmissionBlock) => {
    const isUploading = uploadingBlocks.has(block.id);

    return (
      <Card key={block.id} className="mb-4 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              {block.type === 'text' && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Type className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">Văn bản</span>
                  </div>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    placeholder="Nhập nội dung văn bản..."
                    className="min-h-[120px] text-base resize-none"
                  />
                </div>
              )}
              
              {block.type === 'image' && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Image className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-gray-700">Hình ảnh</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span className="text-sm text-green-700 font-medium">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-3">
                      <img 
                        src={block.content} 
                        alt={block.metadata?.fileName}
                        className="max-w-full h-auto rounded-xl border border-gray-200 shadow-sm"
                      />
                      <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit">
                        {block.metadata?.fileName}
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
                      <span className="text-sm text-gray-500">Đang xử lý hình ảnh...</span>
                    </div>
                  )}
                </div>
              )}
              
              {block.type === 'video' && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Video className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-700">Video</span>
                  </div>
                  {isUploading ? (
                    <div className="flex items-center space-x-3 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="text-sm text-purple-700 font-medium">Đang tải lên {block.metadata?.fileName}...</span>
                    </div>
                  ) : block.content ? (
                    <div className="space-y-3">
                      <video 
                        src={block.content} 
                        controls
                        className="max-w-full h-auto rounded-xl border border-gray-200 shadow-sm"
                      />
                      <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full w-fit">
                        {block.metadata?.fileName}
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-xl text-center border-2 border-dashed border-gray-300">
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
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
              disabled={isUploading}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <Type className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{block.content}</p>
              </div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3 mb-3">
                <Image className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700">Hình ảnh</span>
              </div>
              <img 
                src={block.content} 
                alt="Assignment image"
                className="max-w-full h-auto rounded-lg border border-green-200 shadow-sm"
              />
            </div>
          </div>
        );
      case 'video':
        return (
          <div key={index} className="mb-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start space-x-3 mb-3">
                <Video className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span className="text-sm font-medium text-purple-700">Video</span>
              </div>
              <video 
                src={block.content} 
                controls
                className="max-w-full h-auto rounded-lg border border-purple-200 shadow-sm"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Function to sort and render content blocks in order: text -> image -> video
  const renderSortedContentBlocks = (blocks: any[]) => {
    // Sort blocks by type priority
    const sortedBlocks = [...blocks].sort((a, b) => {
      const typePriority = { 'text': 1, 'image': 2, 'video': 3 };
      return typePriority[a.type as keyof typeof typePriority] - typePriority[b.type as keyof typeof typePriority];
    });

    return sortedBlocks.map((block, index) => renderContentBlock(block, index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  // Submission Modal Component
  const SubmissionModal = () => (
    <Dialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] h-[90vh]' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Nộp bài tập
          </DialogTitle>
          <DialogDescription>
            Thêm nội dung bài làm của bạn bằng văn bản, hình ảnh hoặc video
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Add Content Buttons */}
          <div className="mb-6">
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
              <Button
                type="button"
                variant="outline"
                onClick={addTextBlock}
                className="flex items-center justify-center space-x-3 h-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
              >
                <Type className="w-5 h-5" />
                <span className="font-medium">Thêm văn bản</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={addImageBlock}
                className="flex items-center justify-center space-x-3 h-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
              >
                <Image className="w-5 h-5" />
                <span className="font-medium">Thêm hình ảnh</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={addVideoBlock}
                className="flex items-center justify-center space-x-3 h-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
              >
                <Video className="w-5 h-5" />
                <span className="font-medium">Thêm video</span>
              </Button>
            </div>
          </div>

          {/* Content Blocks */}
          <div>
            {submissionBlocks.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có nội dung nào</h3>
                <p className="text-gray-500 text-sm px-4">
                  Hãy thêm văn bản, hình ảnh hoặc video để hoàn thành bài tập
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissionBlocks.map(renderSubmissionBlock)}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className={`${isMobile ? 'flex-col space-y-2' : 'flex-row space-x-2'}`}>
          <Button
            variant="outline"
            onClick={() => {
              setShowSubmissionModal(false);
              setSubmissionBlocks([]);
              setSelectedAssignmentId('');
            }}
            disabled={isSubmitting}
            className={`${isMobile ? 'w-full' : ''} h-12`}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmitAssignment}
            disabled={isSubmitting || uploadingBlocks.size > 0 || submissionBlocks.length === 0}
            className={`${isMobile ? 'w-full' : ''} h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang nộp bài...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Nộp bài tập</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <SubmissionModal />
        
        {/* Mobile Header */}
        <div className="bg-white shadow-lg border-b sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Bài tập được giao
                </h1>
                {lesson && (
                  <p className="text-xs text-gray-500 truncate">
                    Buổi {lesson.lesson_number}: {lesson.title}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          {/* Lesson Info Card */}
          {lesson && (
            <Card className="shadow-xl border-0 overflow-hidden mb-6">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <CardTitle className="text-xl font-bold flex items-center space-x-3">
                  <BookOpen className="w-6 h-6" />
                  <span>Buổi {lesson.lesson_number}: {lesson.title}</span>
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  {lesson.class.name}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Assignments */}
          {assignments.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài tập</h4>
                <p className="text-gray-500 text-sm">Buổi học này chưa có bài tập nào được giao.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="text-lg flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <span>Bài tập</span>
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-3 h-3" />
                        <span>Giảng viên: {assignment.instructor.fullname}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>Giao ngày: {new Date(assignment.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Nội dung bài tập</h4>
                      {renderSortedContentBlocks(assignment.content.blocks)}
                      
                      {/* Action Button */}
                      <div className="pt-4 border-t">
                        {(() => {
                          const submission = getSubmissionStatus(assignment.id);
                          if (submission && submission.submitted_at) {
                            return (
                              <Button
                                className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                                onClick={() => {
                                  const submission = getSubmissionStatus(assignment.id);
                                  if (submission) {
                                    navigate(`/student/submission/${submission.id}`);
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem bài đã nộp
                              </Button>
                            );
                          } else {
                            return (
                              <Button
                                className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                                onClick={() => openSubmissionModal(assignment.id)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Nộp bài tập
                              </Button>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <SubmissionModal />
      
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                size="sm"
                className="hover:bg-indigo-50 border-indigo-200 text-indigo-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Bài tập được giao
                </h1>
                {lesson && (
                  <p className="text-gray-600 mt-1">
                    Buổi {lesson.lesson_number}: {lesson.title} - {lesson.class.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Lesson Info Card */}
          {lesson && (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
                
                <div className="relative z-10">
                  <CardTitle className="text-3xl font-bold flex items-center space-x-4">
                    <BookOpen className="w-8 h-8" />
                    <span>Buổi {lesson.lesson_number}: {lesson.title}</span>
                  </CardTitle>
                  <CardDescription className="text-indigo-100 text-xl mt-2">
                    {lesson.class.name}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Assignments List */}
          {assignments.length === 0 ? (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-500" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có bài tập nào</h4>
                <p className="text-gray-500 text-lg">Buổi học này chưa có bài tập nào được giao.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center space-x-4">
                          <FileText className="w-7 h-7 text-indigo-500" />
                          <span>Bài tập</span>
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-6 mt-3 text-lg">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5" />
                            <span>Giảng viên: {assignment.instructor.fullname}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5" />
                            <span>Giao ngày: {new Date(assignment.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Nội dung bài tập
                      </h4>
                      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-8 border border-indigo-100">
                        {renderSortedContentBlocks(assignment.content.blocks)}
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        {(() => {
                          const submission = getSubmissionStatus(assignment.id);
                          if (submission && submission.submitted_at) {
                            return (
                              <Button
                                size="lg"
                                className="px-8 py-3 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                onClick={() => {
                                  const submission = getSubmissionStatus(assignment.id);
                                  if (submission) {
                                    navigate(`/student/submission/${submission.id}`);
                                  }
                                }}
                              >
                                <Eye className="w-5 h-5 mr-3" />
                                Xem bài đã nộp
                              </Button>
                            );
                          } else {
                            return (
                              <Button
                                size="lg"
                                className="px-8 py-3 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
                                onClick={() => openSubmissionModal(assignment.id)}
                              >
                                <Send className="w-5 h-5 mr-3" />
                                Nộp bài tập
                              </Button>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLessonAssignmentsPage; 