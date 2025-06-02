
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, MessageSquare, Star, FileImage, FileVideo, File, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  content: string;
  instructions: string | null;
  max_score: number | null;
}

interface Submission {
  id: string;
  student_id: string;
  file_url: string;
  file_type: string;
  content: string | null;
  attachments: any;
  submitted_at: string;
  status: string;
  student: {
    fullname: string;
    email: string;
    avatar_url: string | null;
  };
  feedback?: {
    id: string;
    comment: string;
    score: number;
    created_at: string;
  };
}

interface AssignmentSubmissionsProps {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
}

const AssignmentSubmissions = ({ assignment, isOpen, onClose }: AssignmentSubmissionsProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackScore, setFeedbackScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, assignment.id]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      // Fetch submissions for this assignment
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          id,
          student_id,
          file_url,
          file_type,
          content,
          attachments,
          submitted_at,
          status
        `)
        .eq('assignment_id', assignment.id);

      if (submissionsError) throw submissionsError;

      if (!submissionsData || submissionsData.length === 0) {
        setSubmissions([]);
        return;
      }

      // Fetch student information
      const studentIds = submissionsData.map(s => s.student_id);
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, fullname, email, avatar_url')
        .in('id', studentIds);

      // Fetch feedbacks
      const submissionIds = submissionsData.map(s => s.id);
      const { data: feedbacksData } = await supabase
        .from('feedbacks')
        .select('id, submission_id, comment, score, created_at')
        .in('submission_id', submissionIds);

      // Combine data
      const formattedSubmissions: Submission[] = submissionsData.map(submission => {
        const student = studentsData?.find(s => s.id === submission.student_id);
        const feedback = feedbacksData?.find(f => f.submission_id === submission.id);

        return {
          id: submission.id,
          student_id: submission.student_id,
          file_url: submission.file_url,
          file_type: submission.file_type,
          content: submission.content,
          attachments: submission.attachments,
          submitted_at: submission.submitted_at,
          status: submission.status,
          student: {
            fullname: student?.fullname || 'Không xác định',
            email: student?.email || '',
            avatar_url: student?.avatar_url
          },
          feedback: feedback ? {
            id: feedback.id,
            comment: feedback.comment,
            score: feedback.score || 0,
            created_at: feedback.created_at
          } : undefined
        };
      });

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

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedbackComment(submission.feedback?.comment || '');
    setFeedbackScore(submission.feedback?.score || 0);
    setShowFeedbackModal(true);
  };

  const handleSaveFeedback = async () => {
    if (!selectedSubmission || !feedbackComment.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nhận xét",
        variant: "destructive",
      });
      return;
    }

    setIsSavingFeedback(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      if (selectedSubmission.feedback) {
        // Update existing feedback
        const { error } = await supabase
          .from('feedbacks')
          .update({
            comment: feedbackComment.trim(),
            score: feedbackScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedSubmission.feedback.id);

        if (error) throw error;
      } else {
        // Create new feedback
        const { error } = await supabase
          .from('feedbacks')
          .insert({
            submission_id: selectedSubmission.id,
            teacher_id: currentUser.id,
            comment: feedbackComment.trim(),
            score: feedbackScore
          });

        if (error) throw error;
      }

      toast({
        title: "Thành công",
        description: "Đã lưu nhận xét thành công",
      });

      setShowFeedbackModal(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu nhận xét",
        variant: "destructive",
      });
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.feedback) {
      return <Badge className="bg-blue-100 text-blue-800">Đã chấm</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Chờ chấm</Badge>;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'image') return <FileImage className="h-4 w-4 text-blue-600" />;
    if (fileType === 'video') return <FileVideo className="h-4 w-4 text-purple-600" />;
    return <File className="h-4 w-4 text-gray-600" />;
  };

  const renderSubmissionContent = (submission: Submission) => {
    const attachments = submission.attachments || { files: [], links: [] };
    
    return (
      <div className="space-y-4">
        {submission.content && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Nội dung bài làm:</h4>
            <div className="text-gray-700 whitespace-pre-wrap">{submission.content}</div>
          </div>
        )}

        {submission.file_url && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">File nộp:</h4>
            <div className="flex items-center space-x-2">
              {getFileIcon(submission.file_type)}
              <a 
                href={submission.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Xem file đã nộp
              </a>
            </div>
          </div>
        )}

        {attachments.files && attachments.files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">File đính kèm:</h4>
            {attachments.files.map((file: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                {getFileIcon(file.type)}
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Danh sách bài nộp
            </DialogTitle>
            <DialogDescription>
              Tổng cộng: {submissions.length} bài nộp
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có học sinh nào nộp bài</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {submission.student.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{submission.student.fullname}</CardTitle>
                          <CardDescription className="text-sm">
                            {new Date(submission.submitted_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(submission)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {submission.content && (
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {submission.content}
                          </p>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <Star className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              Điểm: {submission.feedback.score}/{assignment.max_score || 100}
                            </span>
                          </div>
                          <p className="text-sm text-blue-800 line-clamp-2">
                            {submission.feedback.comment}
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={() => handleViewSubmission(submission)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {submission.feedback ? 'Xem & Sửa chấm' : 'Xem & Chấm điểm'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSubmission && (
        <Dialog open={showFeedbackModal} onOpenChange={() => setShowFeedbackModal(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Chấm bài - {selectedSubmission.student.fullname}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Student submission content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Bài làm của học sinh</h3>
                {renderSubmissionContent(selectedSubmission)}
              </div>

              {/* Feedback form */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900">Nhận xét và chấm điểm</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor="score" className="text-base font-medium">
                      Điểm số
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="score"
                        type="number"
                        min="0"
                        max={assignment.max_score || 100}
                        value={feedbackScore}
                        onChange={(e) => setFeedbackScore(parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-gray-500">/ {assignment.max_score || 100}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <Label htmlFor="comment" className="text-base font-medium">
                      Nhận xét *
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Nhập nhận xét cho học sinh..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleSaveFeedback}
                    disabled={isSavingFeedback || !feedbackComment.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isSavingFeedback ? 'Đang lưu...' : 'Lưu nhận xét'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AssignmentSubmissions;
