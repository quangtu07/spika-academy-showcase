
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentWithDetails {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  status: string;
  classes: {
    id: string;
    name: string;
    description: string;
    courses: {
      id: string;
      name: string;
      description: string;
      duration: number;
      image_url: string;
      instructor_name?: string;
    };
  };
}

const StudentCourses = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndFetchEnrollments();
  }, []);

  const checkUserAndFetchEnrollments = async () => {
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
        await fetchEnrollments(user.id);
      } else {
        // Use Supabase user
        setCurrentUser(session.user);
        await fetchEnrollments(session.user.id);
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

  const fetchEnrollments = async (userId: string) => {
    try {
      console.log('=== DEBUG INFO ===');
      console.log('Tìm enrollments cho user:', userId);
      
      // Fetch enrollments with simplified query
      const { data: enrollmentsData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          id,
          student_id,
          class_id,
          enrolled_at,
          status
        `)
        .eq('student_id', userId);
      
      if (enrollmentError) {
        console.error('Supabase error details:', enrollmentError);
        throw enrollmentError;
      }

      if (!enrollmentsData || enrollmentsData.length === 0) {
        console.log('Không tìm thấy enrollment nào cho user này');
        setEnrollments([]);
        return;
      }

      console.log('Enrollments found:', enrollmentsData);

      // Fetch related data separately to avoid nested query issues
      const classIds = enrollmentsData.map(e => e.class_id);
      const { data: classesData } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          course_id,
          instructor_id
        `)
        .in('id', classIds);

      const courseIds = classesData?.map(c => c.course_id) || [];
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          description,
          duration,
          image_url
        `)
        .in('id', courseIds);

      const instructorIds = classesData?.map(c => c.instructor_id) || [];
      const { data: instructorsData } = await supabase
        .from('profiles')
        .select(`
          id,
          fullname
        `)
        .in('id', instructorIds);

      // Combine all data safely
      const formattedEnrollments: EnrollmentWithDetails[] = enrollmentsData.map(enrollment => {
        const classItem = classesData?.find(c => c.id === enrollment.class_id);
        const course = coursesData?.find(c => c.id === classItem?.course_id);
        const instructor = instructorsData?.find(i => i.id === classItem?.instructor_id);

        return {
          id: enrollment.id,
          student_id: enrollment.student_id,
          class_id: enrollment.class_id,
          enrolled_at: enrollment.enrolled_at,
          status: enrollment.status || 'active',
          classes: {
            id: classItem?.id || '',
            name: classItem?.name || 'Tên lớp không có',
            description: classItem?.description || '',
            courses: {
              id: course?.id || '',
              name: course?.name || 'Tên khóa học không có',
              description: course?.description || '',
              duration: course?.duration || 0,
              image_url: course?.image_url || '',
              instructor_name: instructor?.fullname || 'Chưa có thông tin'
            }
          }
        };
      });

      console.log('Successfully formatted enrollments:', formattedEnrollments);
      setEnrollments(formattedEnrollments);
    } catch (error) {
      console.error('Lỗi khi fetch enrollments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đăng ký. Vui lòng kiểm tra kết nối và thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="ml-2 text-gray-600">Đang tải đăng ký...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký lớp học</h2>
        <p className="text-gray-600">Danh sách các lớp học bạn đã đăng ký</p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Bạn chưa đăng ký lớp học nào.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Vui lòng liên hệ quản trị viên để đăng ký lớp học.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src={enrollment.classes.courses.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                  alt={enrollment.classes.courses.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                      {enrollment.classes.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Khóa: {enrollment.classes.courses.name}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>GV: {enrollment.classes.courses.instructor_name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className={
                        enrollment.status === 'active' 
                          ? 'border-green-500 text-green-700 bg-green-50' 
                          : enrollment.status === 'completed'
                          ? 'border-blue-500 text-blue-700 bg-blue-50'
                          : 'border-gray-500 text-gray-700 bg-gray-50'
                      }>
                        {enrollment.status === 'active' ? 'Đang học' : 
                         enrollment.status === 'completed' ? 'Hoàn thành' : 'Đã dừng'}
                      </Badge>
                      {enrollment.classes.courses.duration && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{enrollment.classes.courses.duration} buổi</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {enrollment.classes.description || enrollment.classes.courses.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Đăng ký: {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
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
