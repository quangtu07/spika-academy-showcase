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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndFetchCourses();
  }, []);

  const checkUserAndFetchCourses = async () => {
    try {
      // Check if user is authenticated via Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Fallback to localStorage if no Supabase session
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
          toast({
            title: "Lỗi",
            description: "Vui lòng đăng nhập để xem khóa học",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        await fetchEnrolledCourses(user.id);
      } else {
        // Use Supabase user
        setCurrentUser(session.user);
        await fetchEnrolledCourses(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác thực người dùng",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchEnrolledCourses = async (userId: string) => {
    try {
      console.log('Bước 1: Tìm enrollments cho user:', userId);
      
      // Bước 1: Query vào bảng enrollments dựa theo student_id
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', userId);
      
      console.log('Kết quả enrollments:', enrollments);
      console.log('Lỗi enrollments:', enrollmentError);

      if (enrollmentError) {
        throw enrollmentError;
      }

      if (!enrollments || enrollments.length === 0) {
        console.log('Không tìm thấy enrollment nào cho user này');
        setCourses([]);
        return;
      }

      // Bước 2: Lấy danh sách course_id từ enrollments
      const courseIds = enrollments.map(enrollment => enrollment.course_id);
      console.log('Bước 2: Danh sách course_id từ enrollments:', courseIds);

      // Bước 3: Query vào bảng courses dựa theo course_id
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);

      console.log('Kết quả courses:', coursesData);
      console.log('Lỗi courses:', coursesError);

      if (coursesError) {
        throw coursesError;
      }

      if (!coursesData || coursesData.length === 0) {
        console.log('Không tìm thấy course nào');
        setCourses([]);
        return;
      }

      // Bước 4: Lấy thông tin instructors từ bảng profiles
      const instructorIds = [...new Set(coursesData.map(course => course.instructor_id))];
      console.log('Bước 4: Danh sách instructor_id:', instructorIds);

      const { data: instructorsData, error: instructorsError } = await supabase
        .from('profiles')
        .select('id, fullname')
        .in('id', instructorIds);

      console.log('Kết quả instructors:', instructorsData);
      console.log('Lỗi instructors:', instructorsError);

      if (instructorsError) {
        throw instructorsError;
      }

      // Bước 5: Kết hợp tất cả dữ liệu
      const formattedCourses = coursesData.map(course => {
        // Tìm enrollment tương ứng với course này
        const enrollment = enrollments.find(e => e.course_id === course.id);
        // Tìm instructor tương ứng
        const instructor = instructorsData?.find(i => i.id === course.instructor_id);

        return {
          id: course.id,
          name: course.name,
          description: course.description || '',
          level: course.level || 'basic',
          duration: course.duration || 0,
          instructor: {
            fullname: instructor?.fullname || 'Chưa có thông tin'
          },
          enrollment: {
            status: enrollment?.status || 'active',
            enrolled_at: enrollment?.enrolled_at || ''
          }
        };
      });

      console.log('Bước 5: Dữ liệu cuối cùng được format:', formattedCourses);
      setCourses(formattedCourses);
    } catch (error) {
      console.error('Lỗi khi fetch courses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học. Vui lòng kiểm tra kết nối và thử lại.",
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
        <p className="ml-2 text-gray-600">Đang tải khóa học...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Khóa học đã đăng ký</h2>
        <p className="text-gray-600">Danh sách các khóa học bạn đang tham gia</p>
        {currentUser && (
          <p className="text-sm text-gray-500 mt-1">
            User ID: {currentUser.id}
          </p>
        )}
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Bạn chưa đăng ký khóa học nào.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Vui lòng liên hệ quản trị viên để đăng ký khóa học.
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
                          : course.enrollment.status === 'completed'
                          ? 'border-blue-500 text-blue-700'
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
