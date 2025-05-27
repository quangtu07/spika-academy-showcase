
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  enrollments_count: number;
}

const TeacherCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem khóa học",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          description,
          duration,
          price,
          enrollments (
            id
          )
        `)
        .eq('instructor_id', currentUser.id);

      if (error) throw error;

      const formattedCourses = data?.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description,
        duration: course.duration,
        price: course.price,
        enrollments_count: course.enrollments?.length || 0
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
          <h2 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h2>
          <p className="text-gray-600">Quản lý các khóa học bạn đang giảng dạy</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="h-4 w-4 mr-2" />
          Thêm khóa học
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              Bạn chưa có khóa học nào.
            </p>
            <Button className="mt-4 bg-primary-600 hover:bg-primary-700">
              Tạo khóa học đầu tiên
            </Button>
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
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
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
  );
};

export default TeacherCourses;
