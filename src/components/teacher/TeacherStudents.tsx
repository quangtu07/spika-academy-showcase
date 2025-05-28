
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  fullname: string;
  email: string;
  phone_number: string;
  age: number;
  avatar_url: string;
  enrollment: {
    status: string;
    enrolled_at: string;
    class: {
      id: string;
      name: string;
      course: {
        id: string;
        name: string;
      };
    };
  };
}

const TeacherStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      fetchStudents();
    }
  }, [classes, selectedClass]);

  const fetchTeacherClasses = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!currentUser) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để xem học viên",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          courses!inner(
            id,
            name,
            instructor_id
          )
        `)
        .eq('courses.instructor_id', currentUser.id);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lớp học",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      let query = supabase
        .from('enrollments')
        .select(`
          status,
          enrolled_at,
          class_id,
          classes!inner (
            id,
            name,
            courses!inner (
              id,
              name,
              instructor_id
            )
          ),
          profiles!inner (
            id,
            fullname,
            email,
            phone_number,
            age,
            avatar_url
          )
        `)
        .eq('classes.courses.instructor_id', currentUser.id);

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedStudents = data?.map(enrollment => ({
        id: enrollment.profiles.id,
        fullname: enrollment.profiles.fullname,
        email: enrollment.profiles.email,
        phone_number: enrollment.profiles.phone_number,
        age: enrollment.profiles.age,
        avatar_url: enrollment.profiles.avatar_url,
        enrollment: {
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
          class: {
            id: enrollment.classes.id,
            name: enrollment.classes.name,
            course: {
              id: enrollment.classes.courses.id,
              name: enrollment.classes.courses.name
            }
          }
        }
      })) || [];

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học viên",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (fullname: string) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Đang học</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>;
      case 'dropped':
        return <Badge className="bg-red-100 text-red-800">Đã dừng</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <h2 className="text-2xl font-bold text-gray-900">Học viên</h2>
          <p className="text-gray-600">Danh sách học viên trong các lớp của bạn</p>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Chọn lớp học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lớp học</SelectItem>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              {selectedClass === 'all' 
                ? 'Chưa có học viên nào đăng ký lớp học của bạn.' 
                : 'Chưa có học viên nào trong lớp học này.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <Card key={`${student.id}-${student.enrollment.class.id}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar_url} alt={student.fullname} />
                      <AvatarFallback className="bg-primary-600 text-white">
                        {getInitials(student.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.fullname}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {student.enrollment.class.name}
                        </Badge>
                        {getStatusBadge(student.enrollment.status)}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  {student.phone_number && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{student.phone_number}</span>
                    </div>
                  )}
                  {student.age && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{student.age} tuổi</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Đăng ký: {new Date(student.enrollment.enrolled_at).toLocaleDateString('vi-VN')}</span>
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

export default TeacherStudents;
