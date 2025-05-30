
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CourseFormModal from '@/components/admin/CourseFormModal';

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image_url?: string;
  status: "Đang mở" | "Đang bắt đầu" | "Kết thúc";
  enrollments_count: number;
}

interface Profile {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: string;
}

const TeacherCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') as Profile;

      if (!currentUser?.id) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem khóa học",
          variant: "destructive",
        });
        return;
      }

      // Get classes for the instructor first
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, course_id')
        .eq('instructor_id', currentUser.id);

      if (classesError) throw classesError;

      if (!classesData || classesData.length === 0) {
        setCourses([]);
        setIsLoading(false);
        return;
      }

      // Get unique course IDs
      const courseIds = [...new Set(classesData.map(c => c.course_id))];

      // Get courses data
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, description, duration, price, image_url, status')
        .in('id', courseIds)
        .order('updated_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Get enrollment counts
      let enrollmentCounts: { [key: string]: number } = {};

      if (classesData.length > 0) {
        const classIds = classesData.map(c => c.id);
        
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('class_id')
          .in('class_id', classIds);

        // Count enrollments per course
        classesData.forEach(classItem => {
          const count = enrollmentsData?.filter(e => e.class_id === classItem.id).length || 0;
          if (!enrollmentCounts[classItem.course_id]) {
            enrollmentCounts[classItem.course_id] = 0;
          }
          enrollmentCounts[classItem.course_id] += count;
        });
      }

      const formattedCourses = coursesData?.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description || '',
        duration: course.duration,
        price: course.price || 0,
        image_url: course.image_url,
        status: (course.status || 'Đang mở') as "Đang mở" | "Đang bắt đầu" | "Kết thúc",
        enrollments_count: enrollmentCounts[course.id] || 0
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

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleCourseSaved = () => {
    fetchTeacherCourses();
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const getStatusBadge = (status: "Đang mở" | "Đang bắt đầu" | "Kết thúc") => {
    const statusMap = {
      'Đang mở': { label: 'Đang mở', color: 'bg-green-100 text-green-800' },
      'Đang bắt đầu': { label: 'Đang bắt đầu', color: 'bg-blue-100 text-blue-800' },
      'Kết thúc': { label: 'Kết thúc', color: 'bg-gray-100 text-gray-800' }
    };
    const statusInfo = statusMap[status];
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h2>
            <p className="text-gray-600">Quản lý các khóa học bạn đang giảng dạy</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                Bạn chưa có khóa học nào.
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
                        <Badge variant="outline" className="border-blue-500 text-blue-700">
                          {course.enrollments_count} học viên
                        </Badge>
                        {getStatusBadge(course.status)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollments_count} học viên</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{course.duration} buổi</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {course.price?.toLocaleString('vi-VN')} VNĐ
                      </span>
                      <Button size="sm" variant="outline">
                        Quản lý
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={editingCourse}
        onSaved={handleCourseSaved}
      />
    </>
  );
};

export default TeacherCourses;
