import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Calendar, User, CheckCircle, Clock, AlertCircle, Type, Image, Video, Save, MessageSquare, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import TeacherToolbar from '@/components/teacher/TeacherToolbar';

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
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
  status: 'Chưa làm' | 'Đang chờ chấm' | 'Đã hoàn thành';
  submitted_at: string;
  feedback: string | null;
  student: {
    fullname: string;
    email: string;
  };
  assignment: {
    id: string;
    lesson: {
      id: string;
      title: string;
      lesson_number: number;
      class: {
        name: string;
      };
    };
  };
}

const TeacherSubmissionDetailPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (submissionId) {
      fetchSubmissionDetail();
    }
  }, [submissionId]);

  const fetchSubmissionDetail = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assignment_submissions')
        .select(`
          id,
          assignment_id,
          student_id,
          content,
          status,
          submitted_at,
          feedback,
          student:profiles (
            fullname,
            email
          ),
          assignment:assignments (
            id,
            lesson:lessons (
              id,
              title,
              lesson_number,
              classes (
                name
              )
            )
          )
        `)
        .eq('id', submissionId)
        .single();

      if (error) throw error;

      const submissionData = {
        id: data.id,
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        content: data.content,
        status: data.status,
        submitted_at: data.submitted_at,
        feedback: data.feedback,
        student: data.student || { fullname: 'Không xác định', email: '' },
        assignment: {
          id: data.assignment.id,
          lesson: {
            id: data.assignment.lesson.id,
            title: data.assignment.lesson.title,
            lesson_number: data.assignment.lesson.lesson_number,
            class: data.assignment.lesson.classes || { name: 'Không xác định' }
          }
        }
      };

      setSubmission(submissionData);
      setFeedback(submissionData.feedback || '');
    } catch (error) {
      console.error('Error fetching submission detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bài nộp",
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!submission) return;

    const previousStatus = submission.status;
    setIsSavingFeedback(true);

    try {
      const newStatus = feedback.trim() ? 'Đã hoàn thành' : 'Đang chờ chấm';
      
      const { error } = await (supabase as any)
        .from('assignment_submissions')
        .update({
          feedback: feedback.trim() || null,
          status: newStatus
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Show appropriate success message based on status change
      const isFirstTimeFeedback = previousStatus === 'Đang chờ chấm' && newStatus === 'Đã hoàn thành';
      
      toast({
        title: "Thành công",
        description: isFirstTimeFeedback 
          ? "Nhận xét bài tập thành công - Bài tập đã được hoàn thành!" 
          : "Nhận xét bài tập thành công",
      });

      // Navigate back to LessonAssignmentsPage after successful feedback save
      // Especially when status changes from "Đang chờ chấm" to "Đã hoàn thành"
      if (submission.assignment?.lesson?.id) {
        setTimeout(() => {
          navigate(`/teacher/lesson/${submission.assignment.lesson.id}/assignments`);
        }, 1000); // Wait 1 second to show the success message
      } else {
        // Fallback to previous page if lesson id not available
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu nhận xét. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Chưa làm': { 
        text: 'Chưa làm', 
        class: 'bg-amber-100 text-amber-800 border-amber-400', 
        icon: AlertCircle 
      },
      'Đang chờ chấm': { 
        text: 'Đang chờ chấm', 
        class: 'bg-[#02458b]/10 text-[#02458b] border-[#02458b]/30', 
        icon: Clock 
      },
      'Đã hoàn thành': { 
        text: 'Đã hoàn thành', 
        class: 'bg-emerald-100 text-emerald-800 border-emerald-400', 
        icon: CheckCircle 
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || 
      { text: 'Không xác định', class: 'bg-gray-500/15 text-gray-700 border-gray-300', icon: AlertCircle };

    const IconComponent = statusInfo.icon;

    return (
      <Badge className={`${statusInfo.class} border font-medium px-3 py-1 flex items-center space-x-2`}>
        <IconComponent className="w-4 h-4" />
        <span>{statusInfo.text}</span>
      </Badge>
    );
  };

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="mb-4">
            <div className="bg-[#02458b]/5 rounded-lg p-4 border border-[#02458b]/20">
              <div className="flex items-start space-x-3">
                <Type className="w-5 h-5 text-[#02458b] mt-1 flex-shrink-0" />
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{block.content}</p>
              </div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={index} className="mb-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3 mb-3">
                <Image className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700">Hình ảnh</span>
              </div>
              <img 
                src={block.content} 
                alt="Submission image"
                className="max-w-full h-auto rounded-lg border border-green-200 shadow-sm"
              />
              {block.metadata?.fileName && (
                <p className="text-xs text-green-600 mt-2 bg-green-50 px-2 py-1 rounded">
                  {block.metadata.fileName}
                </p>
              )}
            </div>
          </div>
        );
      case 'video':
        return (
          <div key={index} className="mb-4">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start space-x-3 mb-3">
                <Video className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span className="text-sm font-medium text-purple-700">Video</span>
              </div>
              <video 
                src={block.content} 
                controls
                className="max-w-full h-auto rounded-lg border border-purple-200 shadow-sm"
              />
              {block.metadata?.fileName && (
                <p className="text-xs text-purple-600 mt-2 bg-purple-50 px-2 py-1 rounded">
                  {block.metadata.fileName}
                </p>
              )}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải bài nộp...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="text-center p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy bài nộp</h3>
            <Button onClick={() => navigate(-1)} className="w-full">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Mobile Header */}
        <TeacherToolbar
          title="Chấm bài tập"
          subtitle={submission.student.fullname}
        />

        {/* Mobile Content */}
        <div className="p-4">
          {/* Student Info Card */}
          <Card className="shadow-xl border-0 overflow-hidden mb-6">
            <CardHeader className="bg-[#02458b] text-white">
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-6 h-6" />
                  <span>{submission.student.fullname}</span>
                </div>
                {getStatusBadge(submission.status)}
              </CardTitle>
              <CardDescription className="text-white/80">
                {submission.student.email}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Assignment Info */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#02458b]" />
                <span>Thông tin bài tập</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Bài học</p>
                  <p className="font-medium">Buổi {submission.assignment.lesson.lesson_number}: {submission.assignment.lesson.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lớp học</p>
                  <p className="font-medium">{submission.assignment.lesson.class.name}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Nộp lúc: {new Date(submission.submitted_at).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#02458b]" />
                <span>Nội dung bài làm</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submission.content?.blocks && submission.content.blocks.length > 0 ? (
                renderSortedContentBlocks(submission.content.blocks)
              ) : (
                <p className="text-gray-500 text-center py-8">Không có nội dung</p>
              )}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <span>Nhận xét của giảng viên</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập nhận xét cho học viên..."
                  className="min-h-[120px] text-base resize-none"
                />
                <Button
                  onClick={handleSaveFeedback}
                  disabled={isSavingFeedback}
                  className="w-full h-12 bg-[#02458b] hover:bg-[#02458b]/90"
                >
                  {isSavingFeedback ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang lưu...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-5 h-5" />
                      <span>{feedback.trim() && submission.status === 'Đang chờ chấm' ? 'Hoàn thành chấm bài' : 'Lưu nhận xét'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <TeacherToolbar
        title="Chấm bài tập"
        subtitle={`Bài nộp của ${submission.student.fullname}`}
        rightContent={getStatusBadge(submission.status)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Submission Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Student Info */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-[#02458b]/5 border-b border-[#02458b]/20">
                <CardTitle className="text-2xl flex items-center space-x-4">
                  <GraduationCap className="w-7 h-7 text-[#02458b]" />
                  <div>
                    <span>{submission.student.fullname}</span>
                    <p className="text-base text-gray-600 font-normal mt-1">{submission.student.email}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bài học</p>
                    <p className="font-medium text-lg">Buổi {submission.assignment.lesson.lesson_number}: {submission.assignment.lesson.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Lớp học</p>
                    <p className="font-medium text-lg">{submission.assignment.lesson.class.name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 text-lg">
                      <Calendar className="w-6 h-6 text-gray-500" />
                      <span>Nộp lúc: {new Date(submission.submitted_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Content */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-[#02458b]/5 border-b border-[#02458b]/20">
                <CardTitle className="text-2xl flex items-center space-x-4">
                  <FileText className="w-7 h-7 text-[#02458b]" />
                  <span>Nội dung bài làm</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-[#02458b]/5 rounded-2xl p-8 border border-[#02458b]/20">
                  {submission.content?.blocks && submission.content.blocks.length > 0 ? (
                    renderSortedContentBlocks(submission.content.blocks)
                  ) : (
                    <p className="text-gray-500 text-center py-16 text-xl">Không có nội dung</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Feedback */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm sticky top-8">
              <CardHeader className="bg-green-50 border-b border-green-200">
                <CardTitle className="text-xl flex items-center space-x-3">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                  <span>Nhận xét của giảng viên</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Nhập nhận xét cho học viên..."
                    className="min-h-[200px] text-base resize-none"
                  />
                  <Button
                    onClick={handleSaveFeedback}
                    disabled={isSavingFeedback}
                    className="w-full h-12 bg-[#02458b] hover:bg-[#02458b]/90"
                  >
                    {isSavingFeedback ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang lưu...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="w-5 h-5" />
                        <span>{feedback.trim() && submission.status === 'Đang chờ chấm' ? 'Hoàn thành chấm bài' : 'Lưu nhận xét'}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSubmissionDetailPage; 