import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClassData {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  status: string | null;
  course_id: string;
  courseName: string;
  courseDescription: string | null;
  enrollmentsCount: number;
}

const TeacherClasses = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    try {
      // Lấy thông tin user hiện tại
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser.id) {
        throw new Error('Không tìm thấy thông tin giảng viên');
      }

      console.log('🔍 currentUser:', currentUser);
      // Query lớp học của giảng viên hiện tại
      const { data: classesData } = await (supabase as any)
        .from('classes')
        .select('id, name, description, schedule, status, course_id')
        .eq('instructor_id', currentUser.id);

      if (!classesData) {
        throw new Error('Không thể tải dữ liệu lớp học');
      }

      const result: ClassData[] = [];
      
      for (const classItem of classesData || []) {
        // Lấy thông tin khóa học
        const { data: courseData } = await supabase
          .from('courses')
          .select('name, description')
          .eq('id', classItem.course_id)
          .single();

        // Đếm số học viên
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classItem.id);

        result.push({
          id: classItem.id,
          name: classItem.name,
          description: classItem.description,
          schedule: classItem.schedule,
          status: classItem.status,
          course_id: classItem.course_id,
          courseName: courseData?.name || 'Không xác định',
          courseDescription: courseData?.description || null,
          enrollmentsCount: count || 0
        });
      }

      setClasses(result);
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách lớp học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      'đang hoạt động': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800' },
      'đã kết thúc': { text: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800' },
      'hoàn thành': { text: 'Hoàn thành', class: 'bg-blue-100 text-blue-800' },
      'chờ bắt đầu': { text: 'Chờ bắt đầu', class: 'bg-yellow-100 text-yellow-800' },
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-100 text-gray-800' };
    const normalizedStatus = status?.toString().trim().toLowerCase();
    
    let statusInfo = defaultStatus;
    if (normalizedStatus && statusMap[normalizedStatus as keyof typeof statusMap]) {
      statusInfo = statusMap[normalizedStatus as keyof typeof statusMap];
    }

    return (
      <Badge className={statusInfo.class}>
        {statusInfo.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Chưa có lớp học nào</h3>
              <p className="text-gray-500 mt-1">
                Bạn chưa được phân công giảng dạy lớp học nào.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lớp học của tôi</h2>
          <p className="text-gray-600">Danh sách lớp học bạn đang giảng dạy</p>
        </div>
        <div className="text-sm text-gray-500">
          Tổng cộng: <span className="font-medium">{classes.length}</span> lớp học
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {classItem.name}
                </CardTitle>
                {getStatusBadge(classItem.status)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{classItem.courseName}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* {classItem.description && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {classItem.description}
                  </div>
                )} */}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{classItem.enrollmentsCount} học viên</span>
                  </div>
                  
                  {classItem.schedule && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="truncate text-xs">{classItem.schedule}</span>
                    </div>
                  )}
                </div>

                {/* {classItem.courseDescription && (
                  <div className="text-xs text-gray-500 line-clamp-1">
                    Khóa học: {classItem.courseDescription}
                  </div>
                )} */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherClasses; 