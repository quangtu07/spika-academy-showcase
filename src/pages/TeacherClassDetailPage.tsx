import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, BookOpen, FileText, Plus, Eye, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LessonFormModal from '@/components/admin/LessonFormModal';
import LessonEditModal from '@/components/admin/LessonEditModal';
import AssignmentCreator from '@/components/teacher/AssignmentCreator';
import AssignmentSubmissions from '@/components/teacher/AssignmentSubmissions';
import { DialogDescription } from "@/components/ui/dialog"

interface Enrollment {
  id: string;
  student_id: string;
  enrolled_at: string;
  status: string | null;
  student: {
    fullname: string;
    email: string;
    avatar_url: string | null;
  };
}

interface ClassDetail {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  status: "Đang hoạt động" | "Đã kết thúc" | null;
  course: {
    name: string;
    description: string | null;
  };
  instructor: {
    fullname: string;
    email: string;
  };
  enrollments_count: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  lesson_number: number;
  created_at: string;
  assignments?: Assignment[];
}

interface Assignment {
  id: string;
  content: string;
  instructions: string | null;
  max_score: number | null;
}

const TeacherClassDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showAssignmentCreator, setShowAssignmentCreator] = useState(false);
  const [selectedLessonForAssignment, setSelectedLessonForAssignment] = useState<Lesson | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState<Assignment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchClassDetail();
      fetchLessons();
      fetchEnrollments();
    }
  }, [id]);

  const fetchClassDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          schedule,
          status,
          course:courses(name, description),
          instructor:profiles!classes_instructor_id_fkey(fullname, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get enrollments count
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', id);

      setClassDetail({
        ...data,
        course: data.course,
        instructor: data.instructor,
        enrollments_count: count || 0
      } as any);
    } catch (error) {
      console.error('Error fetching class detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lớp học",
        variant: "destructive",
      });
    }
  };

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          content,
          lesson_number,
          created_at
        `)
        .eq('class_id', id)
        .order('lesson_number', { ascending: true });

      if (error) throw error;

      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài học",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          student_id,
          enrolled_at,
          status,
          student:profiles!enrollments_student_id_fkey(fullname, email, avatar_url)
        `)
        .eq('class_id', id);

      if (error) throw error;

      setEnrollments(data as any || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học sinh",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async (lessonId: string) => {
    try {
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          content,
          instructions,
          max_score
        `)
        .eq('lesson_id', lessonId);

      if (assignmentsError) throw assignmentsError;

      return assignmentsData || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài tập",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleLessonSaved = () => {
    fetchLessons();
  };

  const handleLessonUpdated = () => {
    fetchLessons();
  };

  const handleCreateAssignment = (lesson: Lesson) => {
    setSelectedLessonForAssignment(lesson);
    setShowAssignmentCreator(true);
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignmentForSubmissions(assignment);
    setShowSubmissions(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        {classDetail && (
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{classDetail.name}</h1>
                  <p className="text-blue-100 mb-2">{classDetail.course.name}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{classDetail.enrollments_count} học sinh</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>{classDetail.schedule || 'Chưa có lịch học'}</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={classDetail.status === 'Đang hoạt động' ? 'default' : 'secondary'}
                  className="bg-white/20 text-white"
                >
                  {classDetail.status || 'Không xác định'}
                </Badge>
              </div>
            </div>

            {classDetail.description && (
              <CardContent className="p-6">
                <p className="text-gray-700">{classDetail.description}</p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lessons">Bài học</TabsTrigger>
            <TabsTrigger value="students">Học sinh</TabsTrigger>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Danh sách bài học</h2>
              <Button 
                onClick={() => setShowLessonModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm bài học
              </Button>
            </div>

            {lessons.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Chưa có bài học nào. Hãy tạo bài học đầu tiên!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map(lesson => {
                  return (
                    <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="line-clamp-2">
                              Bài {lesson.lesson_number}: {lesson.title}
                            </CardTitle>
                            <CardDescription>
                              Tạo ngày: {new Date(lesson.created_at).toLocaleDateString('vi-VN')}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateAssignment(lesson)}
                              className="whitespace-nowrap"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Giao bài tập
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setShowEditModal(true);
                              }}
                            >
                              Chỉnh sửa
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {lesson.content && (
                        <CardContent>
                          <p className="text-gray-700 line-clamp-3">{lesson.content}</p>
                        </CardContent>
                      )}

                      {lesson.assignments && lesson.assignments.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Bài tập:</h4>
                            {lesson.assignments.map(assignment => (
                              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="text-sm font-medium line-clamp-2">{assignment.content}</p>
                                  {assignment.max_score && (
                                    <Badge variant="outline" className="mt-1">
                                      Điểm tối đa: {assignment.max_score}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewSubmissions(assignment)}
                                  className="ml-2"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Xem bài nộp
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <h2 className="text-xl font-semibold">Danh sách học sinh ({enrollments.length})</h2>
            
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Chưa có học sinh nào đăng ký lớp này.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrollments.map(enrollment => (
                  <Card key={enrollment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {enrollment.student.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{enrollment.student.fullname}</p>
                          <p className="text-sm text-gray-500 truncate">{enrollment.student.email}</p>
                          <p className="text-xs text-gray-400">
                            Đăng ký: {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
            {classDetail && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tên lớp</Label>
                      <p className="mt-1">{classDetail.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Khóa học</Label>
                      <p className="mt-1">{classDetail.course.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Giảng viên</Label>
                      <p className="mt-1">{classDetail.instructor.fullname}</p>
                      <p className="text-sm text-gray-500">{classDetail.instructor.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Trạng thái</Label>
                      <p className="mt-1">
                        <Badge variant={classDetail.status === 'Đang hoạt động' ? 'default' : 'secondary'}>
                          {classDetail.status || 'Không xác định'}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Lịch học</Label>
                      <p className="mt-1">{classDetail.schedule || 'Chưa có lịch học'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Số học sinh</Label>
                      <p className="mt-1">{classDetail.enrollments_count} học sinh</p>
                    </div>
                  </div>
                  
                  {classDetail.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Mô tả</Label>
                      <p className="mt-1 whitespace-pre-wrap">{classDetail.description}</p>
                    </div>
                  )}

                  {classDetail.course.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Mô tả khóa học</Label>
                      <p className="mt-1 whitespace-pre-wrap">{classDetail.course.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showLessonModal && id && (
        <LessonFormModal
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          classId={id}
          onLessonAdded={handleLessonSaved}
        />
      )}

      {showEditModal && selectedLesson && (
        <LessonEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLesson(null);
          }}
          lesson={selectedLesson}
          onLessonUpdated={handleLessonUpdated}
        />
      )}

      {showAssignmentCreator && selectedLessonForAssignment && (
        <AssignmentCreator
          isOpen={showAssignmentCreator}
          onClose={() => {
            setShowAssignmentCreator(false);
            setSelectedLessonForAssignment(null);
          }}
          lesson={selectedLessonForAssignment}
          onSaved={() => {
            setShowAssignmentCreator(false);
            setSelectedLessonForAssignment(null);
            fetchLessons();
          }}
        />
      )}

      {showSubmissions && selectedAssignmentForSubmissions && (
        <AssignmentSubmissions
          assignment={selectedAssignmentForSubmissions}
          isOpen={showSubmissions}
          onClose={() => {
            setShowSubmissions(false);
            setSelectedAssignmentForSubmissions(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherClassDetailPage;
