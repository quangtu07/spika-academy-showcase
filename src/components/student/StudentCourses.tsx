
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  description: string;
  level: string;
  duration: number;
  instructor: {
    fullname: string;
  };
  enrollment: {
    status: string;
    enrolled_at: string;
  };
}

const StudentCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const { data: currentUser } = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem khóa học",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          status,
          enrolled_at,
          course_id,
          courses (
            id,
            name,
            description,
            level,
            duration,
            instructor:profiles!courses_instructor_id_fkey (
              fullname
            )
          )
        `)
        .eq('student_id', currentUser.id);

      if (error) throw error;

      const formattedCourses = data?.map(enrollment => ({
        id: enrollment.courses.id,
        name: enrollment.courses.name,
        description: enrollment.courses.description,
        level: enrollment.courses.level,
        duration: enrollment.courses.duration,
        instructor: enrollment.courses.instructor,
        enrollment: {
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at
        }
      })) || [];

      setCourses(formattedCourses);
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

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'basic': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advance': return 'Nâng cao';
      default: return level;
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Khóa học đã đăng ký</h2>
        <p className="text-gray-600">Danh sách các khóa học bạn đang tham gia</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Bạn chưa đăng ký khóa học nào.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-2">{course.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getLevelBadgeColor(course.level)}>
                        {getLevelText(course.level)}
                      </Badge>
                      <Badge variant="outline" className={
                        course.enrollment.status === 'active' 
                          ? 'border-green-500 text-green-700' 
                          : 'border-gray-500 text-gray-700'
                      }>
                        {course.enrollment.status === 'active' ? 'Đang học' : 
                         course.enrollment.status === 'completed' ? 'Hoàn thành' : 'Đã dừng'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{course.instructor.fullname}</span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration} buổi</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Đăng ký: {new Date(course.enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                    </p>
                    <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
