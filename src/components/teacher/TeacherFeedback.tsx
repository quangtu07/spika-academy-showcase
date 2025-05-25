
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileImage, FileVideo, MessageSquare, Calendar, User, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  id: string;
  file_url: string;
  file_type: string;
  submitted_at: string;
  status: string;
  student: {
    id: string;
    fullname: string;
    avatar_url: string;
  };
  assignment: {
    id: string;
    title: string;
    lesson: {
      title: string;
      course: {
        name: string;
      };
    };
  };
  feedback?: {
    id: string;
    comment: string;
    score: number;
    created_at: string;
  };
}

const TeacherFeedback = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    comment: '',
    score: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem bài nộp",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          file_url,
          file_type,
          submitted_at,
          status,
          student:profiles!submissions_student_id_fkey (
            id,
            fullname,
            avatar_url
          ),
          assignment:assignments (
            id,
            title,
            lesson:lessons (
              title,
              course:courses!inner (
                name,
                instructor_id
              )
            )
          ),
          feedbacks (
            id,
            comment,
            score,
            created_at
          )
        `)
        .eq('assignment.lesson.course.instructor_id', currentUser.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const formattedSubmissions = data?.map(submission => ({
        id: submission.id,
        file_url: submission.file_url,
        file_type: submission.file_type,
        submitted_at: submission.submitted_at,
        status: submission.status,
        student: submission.student,
        assignment: submission.assignment,
        feedback: submission.feedbacks?.[0]
      })) || [];

      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài nộp",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    if (submission.feedback) {
      setFeedbackForm({
        comment: submission.feedback.comment,
        score: submission.feedback.score.toString()
      });
    } else {
      setFeedbackForm({ comment: '', score: '' });
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSubmission || !feedbackForm.comment.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nhận xét",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const feedbackData = {
        submission_id: selectedSubmission.id,
        teacher_id: currentUser.id,
        comment: feedbackForm.comment,
        score: feedbackForm.score ? parseInt(feedbackForm.score) : null
      };

      let error;
      if (selectedSubmission.feedback) {
        // Update existing feedback
        ({ error } = await supabase
          .from('feedbacks')
          .update(feedbackData)
          .eq('id', selectedSubmission.feedback.id));
      } else {
        // Create new feedback
        ({ error } = await supabase
          .from('feedbacks')
          .insert(feedbackData));
      }

      if (error) throw error;

      // Update submission status
      await supabase
        .from('submissions')
        .update({ status: 'reviewed' })
        .eq('id', selectedSubmission.id);

      toast({
        title: "Thành công",
        description: "Đã gửi nhận xét thành công",
      });

      setSelectedSubmission(null);
      setFeedbackForm({ comment: '', score: '' });
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi nhận xét. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (fullname: string) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Chấm bài và nhận xét</h2>
        <p className="text-gray-600">Đánh giá bài tập của học viên</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submissions List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bài tập đã nộp</h3>
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Chưa có bài tập nào được nộp.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <Card 
                  key={submission.id} 
                  className={`cursor-pointer transition-all ${
                    selectedSubmission?.id === submission.id 
                      ? 'ring-2 ring-primary-500 border-primary-500' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleSubmissionClick(submission)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={submission.student.avatar_url} alt={submission.student.fullname} />
                        <AvatarFallback className="bg-primary-600 text-white text-sm">
                          {getInitials(submission.student.fullname)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {submission.student.fullname}
                          </p>
                          <div className="flex items-center space-x-2">
                            {submission.file_type === 'image' ? (
                              <FileImage className="h-4 w-4 text-blue-600" />
                            ) : (
                              <FileVideo className="h-4 w-4 text-purple-600" />
                            )}
                            {submission.feedback ? (
                              <Badge className="bg-blue-100 text-blue-800">Đã chấm</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Chưa chấm</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {submission.assignment.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(submission.submitted_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Chi tiết và nhận xét</h3>
          {selectedSubmission ? (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedSubmission.student.avatar_url} alt={selectedSubmission.student.fullname} />
                    <AvatarFallback className="bg-primary-600 text-white">
                      {getInitials(selectedSubmission.student.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedSubmission.student.fullname}</CardTitle>
                    <CardDescription>{selectedSubmission.assignment.title}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Bài tập đã nộp:</p>
                  {selectedSubmission.file_type === 'image' ? (
                    <img 
                      src={selectedSubmission.file_url} 
                      alt="Submitted assignment" 
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <video 
                      src={selectedSubmission.file_url} 
                      controls 
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="score" className="text-sm font-medium">
                      Điểm số (0-100)
                    </Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      value={feedbackForm.score}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, score: e.target.value })}
                      placeholder="Nhập điểm số"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comment" className="text-sm font-medium">
                      Nhận xét
                    </Label>
                    <Textarea
                      id="comment"
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                      placeholder="Nhập nhận xét cho học viên..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitFeedback}
                    className="w-full bg-primary-600 hover:bg-primary-700"
                    disabled={isSaving || !feedbackForm.comment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSaving ? 'Đang gửi...' : (selectedSubmission.feedback ? 'Cập nhật nhận xét' : 'Gửi nhận xét')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Chọn một bài tập để xem chi tiết và nhận xét.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherFeedback;
