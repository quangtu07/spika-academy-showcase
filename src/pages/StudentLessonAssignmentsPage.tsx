import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { FileText, Calendar, User, BookOpen, GraduationCap, Type, Image, Video, Send, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudentToolbar from '@/components/student/StudentToolbar';
import StudentNotificationBell from '@/components/student/StudentNotificationBell';



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



  const openSubmissionPage = (assignmentId: string) => {
    navigate(`/student/assignment/${assignmentId}/submit`);
  };

  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
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
          <div className="w-16 h-16 bg-[#02458b] rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }



  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        
        {/* Mobile Header */}
        <StudentToolbar
          title="Bài tập được giao"
          subtitle={lesson ? `Buổi ${lesson.lesson_number}: ${lesson.title}` : undefined}
          rightContent={<StudentNotificationBell />}
        />

        {/* Mobile Content */}
        <div className="p-4">
          {/* Lesson Info Card */}
          {lesson && (
            <Card className="shadow-xl border-0 overflow-hidden mb-6">
              <CardHeader className="bg-[#02458b] text-white">
                <CardTitle className="text-xl font-bold flex items-center space-x-3">
                  {/* <BookOpen className="w-6 h-6" /> */}
                  <span>Buổi {lesson.lesson_number}: {lesson.title}</span>
                </CardTitle>
                {/* <CardDescription className="text-white/80">
                  {lesson.class.name}
                </CardDescription> */}
              </CardHeader>
            </Card>
          )}

          {/* Assignments */}
          {assignments.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-[#02458b]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[#02458b]" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài tập</h4>
                <p className="text-gray-500 text-sm">Buổi học này chưa có bài tập nào được giao.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-[#02458b]/5 border-b">
                    <CardTitle className="text-lg flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-[#02458b]" />
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
                                className="w-full h-11 bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                                onClick={() => openSubmissionPage(assignment.id)}
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
      
      {/* Enhanced Header */}
      <StudentToolbar
        title="Bài tập được giao"
        subtitle={lesson ? `Buổi ${lesson.lesson_number}: ${lesson.title} - ${lesson.class.name}` : undefined}
        rightContent={<StudentNotificationBell />}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Lesson Info Card */}
          {lesson && (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-[#02458b] text-white relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
                
                <div className="relative z-10">
                  <CardTitle className="text-3xl font-bold flex items-center space-x-4">
                    <BookOpen className="w-8 h-8" />
                    <span>Buổi {lesson.lesson_number}: {lesson.title}</span>
                  </CardTitle>
                  {/* <CardDescription className="text-white/80 text-xl mt-2">
                    {lesson.class.name}
                  </CardDescription> */}
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Assignments List */}
          {assignments.length === 0 ? (
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-16 bg-[#02458b]/5 rounded-3xl border border-[#02458b]/20">
                <div className="w-24 h-24 bg-[#02458b]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-[#02458b]" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Chưa có bài tập nào</h4>
                <p className="text-gray-500 text-lg">Buổi học này chưa có bài tập nào được giao.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-[#02458b]/5 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center space-x-4">
                          <FileText className="w-7 h-7 text-[#02458b]" />
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
                      <h4 className="text-2xl font-bold text-[#02458b] mb-6">
                        Nội dung bài tập
                      </h4>
                      <div className="bg-[#02458b]/5 rounded-2xl p-8 border border-[#02458b]/20">
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
                                className="px-8 py-3 text-lg bg-[#02458b] hover:bg-[#02458b]/90 text-white shadow-lg"
                                onClick={() => openSubmissionPage(assignment.id)}
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