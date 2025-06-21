import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileText, Calendar, User, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import TeacherToolbar from '@/components/teacher/TeacherToolbar';

interface Assignment {
  id: string;
  lesson: {
    id: string;
    title: string;
    lesson_number: number;
    class: {
      name: string;
    };
  };
}

interface Submission {
  id: string;
  status: 'Chưa làm' | 'Đang chờ chấm' | 'Đã hoàn thành';
  submitted_at: string | null;
  content: any;
  feedback: string | null;
  student: {
    fullname: string;
    email: string;
  };
}

const AssignmentSubmissionsPage = () => {
  const { assignmentId, status } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Convert URL param to Vietnamese status
  const getStatusFromParam = (param: string | undefined) => {
    switch (param) {
      case 'chua-lam': return 'Chưa làm';
      case 'dang-cho-cham': return 'Đang chờ chấm';
      case 'da-hoan-thanh': return 'Đã hoàn thành';
      default: return 'Chưa làm';
    }
  };

  const statusFilter = getStatusFromParam(status);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentInfo();
      fetchSubmissions();
    }
  }, [assignmentId, status]);

  const fetchAssignmentInfo = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assignments')
        .select(`
          id,
          lesson:lessons (
            id,
            title,
            lesson_number,
            classes (
              name
            )
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (error) throw error;

      setAssignment({
        id: data.id,
        lesson: {
          id: data.lesson.id,
          title: data.lesson.title,
          lesson_number: data.lesson.lesson_number,
          class: data.lesson.classes || { name: 'Không xác định' }
        }
      });
    } catch (error) {
      console.error('Error fetching assignment info:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bài tập",
        variant: "destructive",
      });
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('assignment_submissions')
        .select(`
          id,
          status,
          submitted_at,
          content,
          feedback,
          student:profiles (
            fullname,
            email
          )
        `)
        .eq('assignment_id', assignmentId)
        .eq('status', statusFilter)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const formattedSubmissions = data?.map((submission: any) => ({
        id: submission.id,
        status: submission.status,
        submitted_at: submission.submitted_at,
        content: submission.content,
        feedback: submission.feedback,
        student: submission.student || { fullname: 'Không xác định', email: '' }
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
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'Chưa làm': { text: 'Chưa làm', class: 'bg-amber-500/15 text-amber-700 border-amber-300', icon: AlertCircle },
      'Đang chờ chấm': { text: 'Đang chờ chấm', class: 'bg-blue-500/15 text-blue-700 border-blue-300', icon: Clock },
      'Đã hoàn thành': { text: 'Đã hoàn thành', class: 'bg-emerald-500/15 text-emerald-700 border-emerald-300', icon: CheckCircle },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || 
      { text: 'Không xác định', class: 'bg-gray-500/15 text-gray-700 border-gray-300', icon: AlertCircle };

    const IconComponent = statusInfo.icon;

    return (
      <Badge className={`${statusInfo.class} border font-medium px-3 py-1 flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{statusInfo.text}</span>
      </Badge>
    );
  };

  const getStatusIcon = () => {
    switch (statusFilter) {
      case 'Chưa làm': return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'Đang chờ chấm': return <Clock className="w-6 h-6 text-blue-500" />;
      case 'Đã hoàn thành': return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      default: return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (statusFilter) {
      case 'Chưa làm': return 'from-amber-500 to-orange-500';
      case 'Đang chờ chấm': return 'from-[#02458b] to-[#02458b]/80';
      case 'Đã hoàn thành': return 'from-emerald-500 to-green-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải danh sách bài nộp...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="text-center p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy bài tập</h3>
            <Button onClick={() => navigate(-1)} className="w-full">
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toolbarTitle = `${statusFilter}`;
  const toolbarSubtitle = `Buổi ${assignment.lesson.lesson_number}: ${assignment.lesson.title} - ${assignment.lesson.class.name}`;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <TeacherToolbar 
          title={toolbarTitle}
          subtitle={toolbarSubtitle}
        />

        {/* Mobile Content */}
        <div className="p-4">
          {/* Assignment Info Card */}
          <Card className="shadow-xl border-0 mb-6">
            <CardHeader className={`bg-gradient-to-r ${getStatusColor()} text-white`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div>
                  <CardTitle className="text-lg">{statusFilter}</CardTitle>
                  <CardDescription className="text-white/80 text-sm">
                    {assignment.lesson.class.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Submissions List */}
          {submissions.length === 0 ? (
            <Card className="shadow-xl border-0">
              <CardContent className="text-center py-12">
                {getStatusIcon()}
                <h4 className="text-lg font-bold text-gray-900 mb-2 mt-4">Không có dữ liệu</h4>
                <p className="text-gray-500">Không có học viên nào ở trạng thái "{statusFilter}"</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <Card key={submission.id} className="shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-[#02458b] rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{submission.student.fullname}</h4>
                        <p className="text-sm text-gray-600 truncate">{submission.student.email}</p>
                        <div className="flex items-center justify-between mt-2">
                          {submission.submitted_at && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(submission.submitted_at).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                          {getStatusBadge(submission.status)}
                        </div>
                        
                        {/* Action Button for Mobile */}
                        {submission.submitted_at && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <Button 
                              size="sm"
                              className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                              onClick={() => navigate(`/teacher/submission/${submission.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Xem bài nộp
                            </Button>
                          </div>
                        )}
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
      <TeacherToolbar 
        title={toolbarTitle}
        subtitle={toolbarSubtitle}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Assignment Info */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className={`bg-gradient-to-r ${getStatusColor()} text-white`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {getStatusIcon()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{statusFilter}</CardTitle>
                  <CardDescription className="text-white/80">
                    Danh sách học viên có trạng thái "{statusFilter}"
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Submissions Table */}
          {submissions.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  {getStatusIcon()}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Không có dữ liệu</h4>
                <p className="text-gray-500 text-lg">Không có học viên nào ở trạng thái "{statusFilter}"</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-[#02458b]" />
                  <span>Danh sách học viên ({submissions.length})</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#02458b]/5">
                      <TableRow>
                        <TableHead className="font-bold text-lg py-6">Học viên</TableHead>
                        <TableHead className="font-bold text-lg">Email</TableHead>
                        <TableHead className="font-bold text-lg">Ngày nộp</TableHead>
                        <TableHead className="font-bold text-lg">Trạng thái</TableHead>
                        <TableHead className="font-bold text-lg text-center">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id} className="hover:bg-[#02458b]/5 transition-colors">
                          <TableCell className="font-medium py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-[#02458b] rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-lg">{submission.student.fullname}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-lg">{submission.student.email}</TableCell>
                          <TableCell className="text-lg">
                            {submission.submitted_at ? (
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{new Date(submission.submitted_at).toLocaleDateString('vi-VN')}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Chưa nộp</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(submission.status)}
                          </TableCell>
                          <TableCell className="text-center">
                            {submission.submitted_at ? (
                              <Button 
                                size="sm"
                                className="bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                                onClick={() => navigate(`/teacher/submission/${submission.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem bài nộp
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">Chưa có bài nộp</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmissionsPage; 