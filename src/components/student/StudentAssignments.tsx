
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileImage, FileVideo, MessageSquare, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AssignmentUpload from './AssignmentUpload';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  lesson: {
    title: string;
    course: {
      name: string;
    };
  };
  submission?: {
    id: string;
    file_url: string;
    file_type: string;
    submitted_at: string;
    status: string;
    feedback?: {
      comment: string;
      score: number;
      created_at: string;
    };
  };
}

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser.id) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem bài tập",
          variant: "destructive",
        });
        return;
      }

      // Fetch assignments with simplified queries to avoid type issues
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          lesson_id
        `);

      if (assignmentsError) throw assignmentsError;

      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([]);
        return;
      }

      // Fetch related data separately to avoid deep nesting issues
      const lessonIds = assignmentsData.map(a => a.lesson_id);
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id, title, class_id')
        .in('id', lessonIds);

      const classIds = lessonsData?.map(l => l.class_id) || [];
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, course_id')
        .in('id', classIds);

      const courseIds = classesData?.map(c => c.course_id) || [];
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds);

      // Fetch submissions for current user
      const assignmentIds = assignmentsData.map(a => a.id);
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select(`
          id,
          assignment_id,
          file_url,
          file_type,
          submitted_at,
          status
        `)
        .eq('student_id', currentUser.id)
        .in('assignment_id', assignmentIds);

      // Fetch feedbacks
      const submissionIds = submissionsData?.map(s => s.id) || [];
      const { data: feedbacksData } = await supabase
        .from('feedbacks')
        .select(`
          submission_id,
          comment,
          score,
          created_at
        `)
        .in('submission_id', submissionIds);

      // Combine all data
      const formattedAssignments: Assignment[] = assignmentsData.map(assignment => {
        const lesson = lessonsData?.find(l => l.id === assignment.lesson_id);
        const classItem = classesData?.find(c => c.id === lesson?.class_id);
        const course = coursesData?.find(c => c.id === classItem?.course_id);
        const submission = submissionsData?.find(s => s.assignment_id === assignment.id);
        const feedback = feedbacksData?.find(f => f.submission_id === submission?.id);

        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description || '',
          due_date: assignment.due_date || '',
          lesson: {
            title: lesson?.title || 'Không có tiêu đề',
            course: {
              name: course?.name || 'Không có tên khóa học'
            }
          },
          submission: submission ? {
            id: submission.id,
            file_url: submission.file_url,
            file_type: submission.file_type,
            submitted_at: submission.submitted_at,
            status: submission.status || 'submitted',
            feedback: feedback ? {
              comment: feedback.comment,
              score: feedback.score || 0,
              created_at: feedback.created_at
            } : undefined
          } : undefined
        };
      });

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài tập",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setSelectedAssignment(null);
    fetchAssignments();
    toast({
      title: "Thành công",
      description: "Đã nộp bài tập thành công",
    });
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission) {
      if (assignment.submission.feedback) {
        return <Badge className="bg-blue-100 text-blue-800">Đã chấm</Badge>;
      }
      return <Badge className="bg-yellow-100 text-yellow-800">Đã nộp</Badge>;
    }
    
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    
    if (dueDate < now) {
      return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Chưa nộp</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bài tập về nhà</h2>
          <p className="text-gray-600">Danh sách bài tập và trạng thái nộp bài</p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Chưa có bài tập nào.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-2">{assignment.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{assignment.lesson.course.name}</Badge>
                        <Badge variant="outline">{assignment.lesson.title}</Badge>
                        {getStatusBadge(assignment)}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {assignment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignment.due_date && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Hạn nộp: {new Date(assignment.due_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}

                    {assignment.submission ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          {assignment.submission.file_type === 'image' ? (
                            <FileImage className="h-4 w-4 text-blue-600" />
                          ) : (
                            <FileVideo className="h-4 w-4 text-purple-600" />
                          )}
                          <span className="text-gray-600">
                            Đã nộp: {new Date(assignment.submission.submitted_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        {assignment.submission.feedback && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-900">Nhận xét từ giảng viên</span>
                              {assignment.submission.feedback.score && (
                                <Badge className="bg-blue-600 text-white">
                                  {assignment.submission.feedback.score}/100
                                </Badge>
                              )}
                            </div>
                            <p className="text-blue-800 text-sm">
                              {assignment.submission.feedback.comment}
                            </p>
                            <p className="text-blue-600 text-xs mt-2">
                              {new Date(assignment.submission.feedback.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowUploadModal(true);
                        }}
                        className="w-full bg-primary-600 hover:bg-primary-700"
                        disabled={assignment.due_date && new Date(assignment.due_date) < new Date()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Nộp bài tập
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && selectedAssignment && (
        <AssignmentUpload
          assignment={selectedAssignment}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default StudentAssignments;
