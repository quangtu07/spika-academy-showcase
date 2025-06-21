import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Calendar, GraduationCap, Clock, ArrowRight } from 'lucide-react';
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
  const navigate = useNavigate();
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
      'đang hoạt động': { text: 'Đang hoạt động', class: 'bg-green-100 text-green-800 border-green-200' },
      'đã kết thúc': { text: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800 border-gray-200' },
      'hoàn thành': { text: 'Hoàn thành', class: 'bg-blue-100 text-blue-800 border-blue-200' },
      'chờ bắt đầu': { text: 'Chờ bắt đầu', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    };

    const defaultStatus = { text: 'Không xác định', class: 'bg-gray-100 text-gray-800 border-gray-200' };
    const normalizedStatus = status?.toString().trim().toLowerCase();
    
    let statusInfo = defaultStatus;
    if (normalizedStatus && statusMap[normalizedStatus as keyof typeof statusMap]) {
      statusInfo = statusMap[normalizedStatus as keyof typeof statusMap];
    }

    return (
      <Badge className={`${statusInfo.class} font-medium px-3 py-1`}>
        {statusInfo.text}
      </Badge>
    );
  };

  const handleClassClick = (classId: string) => {
    navigate(`/teacher/class/${classId}`);
  };

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-lg">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded mt-4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-[#02458b]/10 rounded-full flex items-center justify-center shadow-lg">
            <GraduationCap className="w-12 h-12 text-[#02458b]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Chưa có lớp học nào</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Bạn chưa được phân công giảng dạy lớp học nào. Hãy liên hệ với quản trị viên để được phân công lớp học.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#02458b] rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Tổng số lớp học</p>
              <p className="text-3xl font-bold">{classes.length}</p>
            </div>
            <GraduationCap className="w-10 h-10 text-white/70" />
          </div>
        </div>
        
        <div className="bg-[#02458b]/90 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Lớp đang hoạt động</p>
              <p className="text-3xl font-bold">
                {classes.filter(c => c.status?.toLowerCase() === 'đang hoạt động').length}
              </p>
            </div>
            <Users className="w-10 h-10 text-white/70" />
          </div>
        </div>
        
        <div className="bg-[#02458b]/80 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Tổng học viên</p>
              <p className="text-3xl font-bold">
                {classes.reduce((sum, c) => sum + c.enrollmentsCount, 0)}
              </p>
            </div>
            <BookOpen className="w-10 h-10 text-white/70" />
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {classes.map((classItem) => (
          <Card 
            key={classItem.id} 
            className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-0 shadow-lg overflow-hidden"
            onClick={() => handleClassClick(classItem.id)}
          >
            <CardHeader className="bg-[#02458b] text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl font-bold text-white line-clamp-2 group-hover:text-white/90 transition-colors">
                    {classItem.name}
                  </CardTitle>
                  {getStatusBadge(classItem.status)}
                </div>
                <CardDescription className="text-white/80 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">{classItem.courseName}</span>
                </CardDescription>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-white/5 rounded-full"></div>
            </CardHeader>
            
            <CardContent className="p-6 bg-white">
              <div className="space-y-4">
                {/* Class Description */}
                {/* {classItem.description && (
                  <div className="bg-gradient-to-r from-gray-50 to-[#02458b]/5 rounded-lg p-4 border border-[#02458b]/20">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {classItem.description}
                    </p>
                  </div>
                )} */}
                
                {/* Class Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4 text-[#02458b]" />
                    <span className="text-sm font-medium">{classItem.enrollmentsCount} học viên</span>
                  </div>
                  
                  {classItem.schedule && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4 text-[#02458b]" />
                      <span className="text-sm font-medium truncate">{classItem.schedule}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Button */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Nhấn để xem chi tiết</span>
                    <ArrowRight className="w-4 h-4 text-[#02458b] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherClasses;
