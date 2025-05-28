
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, BookOpen, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseReport {
  id: string;
  name: string;
  total_students: number;
  active_students: number;
  total_assignments: number;
  submitted_assignments: number;
  average_score: number;
  completion_rate: number;
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  assignments_submitted: number;
  total_assignments: number;
  average_score: number;
  completion_percentage: number;
}

const TeacherReports = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseReport, setCourseReport] = useState<CourseReport | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseReport();
      fetchStudentProgress();
    }
  }, [selectedCourse]);

  const fetchTeacherCourses = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem báo cáo",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .eq('instructor_id', currentUser.id);

      if (error) throw error;
      
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseReport = async () => {
    if (!selectedCourse) return;

    try {
      // Get course info
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, name')
        .eq('id', selectedCourse)
        .single();

      if (courseError) throw courseError;

      // Get classes for this course
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('course_id', selectedCourse);

      if (classesError) throw classesError;

      const classIds = classesData?.map(c => c.id) || [];

      // Get enrollments count
      let totalStudents = 0;
      let activeStudents = 0;
      
      if (classIds.length > 0) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('status')
          .in('class_id', classIds);

        if (enrollmentsError) throw enrollmentsError;

        totalStudents = enrollmentsData?.length || 0;
        activeStudents = enrollmentsData?.filter(e => e.status === 'active').length || 0;
      }

      // Get lessons for these classes
      let totalAssignments = 0;
      let submittedAssignments = 0;
      let allScores: number[] = [];

      if (classIds.length > 0) {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id')
          .in('class_id', classIds);

        if (lessonsError) throw lessonsError;

        const lessonIds = lessonsData?.map(l => l.id) || [];

        if (lessonIds.length > 0) {
          // Get assignments
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('assignments')
            .select('id')
            .in('lesson_id', lessonIds);

          if (assignmentsError) throw assignmentsError;

          totalAssignments = assignmentsData?.length || 0;

          if (totalAssignments > 0) {
            const assignmentIds = assignmentsData?.map(a => a.id) || [];

            // Get submissions
            const { data: submissionsData, error: submissionsError } = await supabase
              .from('submissions')
              .select('id')
              .in('assignment_id', assignmentIds);

            if (submissionsError) throw submissionsError;

            submittedAssignments = submissionsData?.length || 0;

            if (submittedAssignments > 0) {
              const submissionIds = submissionsData?.map(s => s.id) || [];

              // Get feedbacks with scores
              const { data: feedbacksData, error: feedbacksError } = await supabase
                .from('feedbacks')
                .select('score')
                .in('submission_id', submissionIds)
                .not('score', 'is', null);

              if (feedbacksError) throw feedbacksError;

              allScores = feedbacksData?.map(f => f.score).filter(s => s !== null) as number[] || [];
            }
          }
        }
      }

      const averageScore = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;

      const completionRate = totalAssignments > 0 && totalStudents > 0
        ? (submittedAssignments / (totalStudents * totalAssignments)) * 100 
        : 0;

      setCourseReport({
        id: courseData.id,
        name: courseData.name,
        total_students: totalStudents,
        active_students: activeStudents,
        total_assignments: totalAssignments,
        submitted_assignments: submittedAssignments,
        average_score: averageScore,
        completion_rate: completionRate
      });

    } catch (error) {
      console.error('Error fetching course report:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải báo cáo khóa học",
        variant: "destructive",
      });
    }
  };

  const fetchStudentProgress = async () => {
    if (!selectedCourse) return;

    try {
      // Get classes for this course
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('course_id', selectedCourse);

      if (classesError) throw classesError;

      const classIds = classesData?.map(c => c.id) || [];

      if (classIds.length === 0) {
        setStudentProgress([]);
        return;
      }

      // Get enrollments with student info
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          profiles!enrollments_student_id_fkey (
            fullname
          )
        `)
        .in('class_id', classIds)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      const progressData: StudentProgress[] = [];

      for (const enrollment of enrollmentsData || []) {
        // Get lessons for these classes
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id')
          .in('class_id', classIds);

        const lessonIds = lessonsData?.map(l => l.id) || [];
        let totalAssignments = 0;
        let submittedCount = 0;
        let scores: number[] = [];

        if (lessonIds.length > 0) {
          // Get assignments
          const { data: assignmentsData } = await supabase
            .from('assignments')
            .select('id')
            .in('lesson_id', lessonIds);

          totalAssignments = assignmentsData?.length || 0;

          if (totalAssignments > 0) {
            const assignmentIds = assignmentsData?.map(a => a.id) || [];

            // Get student submissions
            const { data: submissionsData } = await supabase
              .from('submissions')
              .select('id')
              .in('assignment_id', assignmentIds)
              .eq('student_id', enrollment.student_id);

            submittedCount = submissionsData?.length || 0;

            if (submittedCount > 0) {
              const submissionIds = submissionsData?.map(s => s.id) || [];

              // Get feedbacks with scores
              const { data: feedbacksData } = await supabase
                .from('feedbacks')
                .select('score')
                .in('submission_id', submissionIds)
                .not('score', 'is', null);

              scores = feedbacksData?.map(f => f.score).filter(s => s !== null) as number[] || [];
            }
          }
        }

        const averageScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;

        const completionPercentage = totalAssignments > 0 
          ? (submittedCount / totalAssignments) * 100 
          : 0;

        progressData.push({
          student_id: enrollment.student_id,
          student_name: enrollment.profiles.fullname,
          assignments_submitted: submittedCount,
          total_assignments: totalAssignments,
          average_score: averageScore,
          completion_percentage: completionPercentage
        });
      }

      setStudentProgress(progressData);

    } catch (error) {
      console.error('Error fetching student progress:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tiến độ học viên",
        variant: "destructive",
      });
    }
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Xuất sắc</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">Giỏi</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Khá</Badge>;
    if (score >= 60) return <Badge className="bg-orange-100 text-orange-800">Trung bình</Badge>;
    return <Badge className="bg-red-100 text-red-800">Yếu</Badge>;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo tiến độ</h2>
          <p className="text-gray-600">Theo dõi tiến độ học tập của lớp</p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Chọn khóa học" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {courseReport && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseReport.total_students}</div>
                <p className="text-xs text-muted-foreground">
                  {courseReport.active_students} đang học
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseReport.total_assignments}</div>
                <p className="text-xs text-muted-foreground">
                  {courseReport.submitted_assignments} bài đã nộp
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courseReport.average_score.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  /100 điểm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courseReport.completion_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  bài tập đã nộp
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Student Progress Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ từng học viên</CardTitle>
              <CardDescription>
                Chi tiết tiến độ học tập của từng học viên trong lớp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentProgress.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    Chưa có dữ liệu tiến độ học viên.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentProgress.map((student) => (
                    <div key={student.student_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{student.student_name}</h4>
                        <div className="flex items-center space-x-2">
                          {student.average_score > 0 && getPerformanceBadge(student.average_score)}
                          <Badge variant="outline">
                            {student.completion_percentage.toFixed(0)}% hoàn thành
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="text-sm">
                          <span className="text-gray-600">Bài tập đã nộp:</span>
                          <span className="ml-2 font-medium">
                            {student.assignments_submitted}/{student.total_assignments}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-gray-600">Điểm trung bình:</span>
                          <span className="ml-2 font-medium">
                            {student.average_score > 0 ? student.average_score.toFixed(1) : 'Chưa có'}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-gray-600">Tiến độ:</span>
                          <div className="ml-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${student.completion_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TeacherReports;
