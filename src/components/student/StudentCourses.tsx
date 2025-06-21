import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, User, GraduationCap, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

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
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { 
        text: 'Đang học', 
        class: 'bg-green-100 text-green-800 border-green-200' 
      },
      'completed': { 
        text: 'Hoàn thành', 
        class: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'inactive': { 
        text: 'Đã dừng', 
        class: 'bg-gray-100 text-gray-800 border-gray-200' 
      }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.inactive;

    return (
      <Badge className={`${statusInfo.class} border font-medium px-3 py-1`}>
        {statusInfo.text}
      </Badge>
    );
  };

  const handleViewClassDetail = (classId: string) => {
    navigate(`/student/class/${classId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02458b] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải lớp học...</p>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#02458b]">
            Lớp học của bạn
          </h2>
          <p className="text-gray-600 text-sm mt-1">Danh sách các lớp học bạn đã đăng ký</p>
        </div>

        {enrollments.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-[#02458b]/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-[#02458b]" />
              </div>
              <p className="text-gray-600 text-center font-medium mb-2">
                Chưa có lớp học nào
              </p>
              <p className="text-xs text-gray-500 text-center px-4">
                Vui lòng liên hệ quản trị viên để đăng ký lớp học.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                {/* Course Image */}
                <div className="relative">
                  <img
                    src={enrollment.classes.courses.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                    alt={enrollment.classes.courses.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(enrollment.status)}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Course Title */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                        {enrollment.classes.name}
                      </h3>
                      <p className="text-sm text-[#02458b] font-medium mt-1">
                        {enrollment.classes.courses.name}
                      </p>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4 text-[#02458b]" />
                        <span className="truncate">GV: {enrollment.classes.courses.instructor_name}</span>
                      </div>
                      
                      {enrollment.classes.courses.duration && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-[#02458b]" />
                          <span>{enrollment.classes.courses.duration} buổi</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-[#02458b]" />
                        <span>Đăng ký: {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {enrollment.classes.description || enrollment.classes.courses.description}
                    </p>

                    {/* Action Button */}
                    <Button 
                      size="sm" 
                      onClick={() => handleViewClassDetail(enrollment.class_id)}
                      className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#02458b]">
          Lớp học của bạn
        </h2>
        <p className="text-gray-600 mt-2 text-lg">Danh sách các lớp học bạn đã đăng ký</p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-[#02458b]/10 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-12 w-12 text-[#02458b]" />
            </div>
            <p className="text-gray-600 text-center text-xl font-medium mb-4">
              Chưa có lớp học nào
            </p>
            <p className="text-gray-500 text-center">
              Vui lòng liên hệ quản trị viên để đăng ký lớp học.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden hover:scale-105">
              {/* Course Image */}
              <div className="relative">
                <img
                  src={enrollment.classes.courses.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                  alt={enrollment.classes.courses.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3">
                  {getStatusBadge(enrollment.status)}
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-[#02458b] transition-colors">
                    {enrollment.classes.name}
                  </CardTitle>
                  <p className="text-sm text-[#02458b] font-semibold">
                    {enrollment.classes.courses.name}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-[#02458b]" />
                    <span className="truncate">GV: {enrollment.classes.courses.instructor_name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {enrollment.classes.courses.duration && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{enrollment.classes.courses.duration} buổi</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {enrollment.classes.description || enrollment.classes.courses.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Đăng ký: {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleViewClassDetail(enrollment.class_id)}
                      className="bg-[#02458b] hover:bg-[#02458b]/90 text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Chi tiết
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
