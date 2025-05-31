
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, UserCheck, GraduationCap, BookOpen, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: 'student' | 'teacher' | 'admin';
  age?: number;
  phone_number?: string;
  created_at: string;
  avatar_url?: string;
}

interface Enrollment {
  id: string;
  enrolled_at: string;
  classes: {
    id: string;
    name: string;
    courses: {
      name: string;
    };
  };
}

interface TeacherClass {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  courses: {
    name: string;
  };
  enrollments: Array<{
    student: {
      fullname: string;
    };
  }>;
}

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUser(userData);

      if (userData.role === 'student') {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select(`
            id,
            enrolled_at,
            classes (
              id,
              name,
              courses (
                name
              )
            )
          `)
          .eq('student_id', userId);

        setEnrollments(enrollmentData || []);
      }

      if (userData.role === 'teacher') {
        const { data: classData } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            description,
            schedule,
            courses (
              name
            ),
            enrollments (
              student:profiles (
                fullname
              )
            )
          `)
          .eq('instructor_id', userId);

        setTeacherClasses(classData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const userRoleTab = user?.role === 'student' ? 'student' : 
                       user?.role === 'teacher' ? 'teacher' : 'admin';
    navigate('/admin', { 
      state: { 
        activeTab: 'users',
        userRoleTab: userRoleTab
      } 
    });
  };

  const getRoleBadge = (role: string) => {
    const configs = {
      'student': { label: 'Học viên', color: 'bg-blue-100 text-blue-800', icon: UserCheck },
      'teacher': { label: 'Giáo viên', color: 'bg-green-100 text-green-800', icon: GraduationCap },
      'admin': { label: 'Quản trị', color: 'bg-purple-100 text-purple-800', icon: Shield }
    };
    const config = configs[role] || configs.student;
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <config.icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getInitials = (fullname: string) => {
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Không tìm thấy người dùng</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleBack}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url} alt={user.fullname} />
                <AvatarFallback className="bg-blue-500 text-white text-xl">
                  {getInitials(user.fullname)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.fullname}</h2>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone_number && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Tham gia {formatDate(user.created_at)}</span>
                  </div>
                  {user.age && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{user.age} tuổi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs defaultValue="activity">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="activity">
              <BookOpen className="h-4 w-4 mr-2" />
              Hoạt động
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            {user.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Lớp học đã tham gia ({enrollments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên lớp</TableHead>
                          <TableHead>Khóa học</TableHead>
                          <TableHead>Ngày tham gia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell className="font-medium">{enrollment.classes.name}</TableCell>
                            <TableCell>{enrollment.classes.courses.name}</TableCell>
                            <TableCell>{formatDate(enrollment.enrolled_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Chưa tham gia lớp học nào</p>
                  )}
                </CardContent>
              </Card>
            )}

            {user.role === 'teacher' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Lớp học đang giảng dạy ({teacherClasses.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teacherClasses.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên lớp</TableHead>
                          <TableHead>Khóa học</TableHead>
                          <TableHead>Lịch học</TableHead>
                          <TableHead>Số học viên</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teacherClasses.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell className="font-medium">{classItem.name}</TableCell>
                            <TableCell>{classItem.courses.name}</TableCell>
                            <TableCell>{classItem.schedule || '-'}</TableCell>
                            <TableCell>{classItem.enrollments.length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Chưa có lớp học nào</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDetailPage;
