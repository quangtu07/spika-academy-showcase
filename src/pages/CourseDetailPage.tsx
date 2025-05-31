
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Image, BookOpen, Clock, DollarSign, Calendar, TrendingUp, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image_url?: string;
  status?: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
  created_at: string;
  updated_at?: string;
  enrolled_count: number;
  classes?: Array<{
    id: string;
    name: string;
    schedule?: string;
    status?: string;
    enrolled_count: number;
  }>;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          classes(
            id,
            name,
            schedule,
            status,
            enrollments(count)
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;

      const courseWithDetails = {
        ...data,
        classes: data.classes?.map((classItem: any) => ({
          ...classItem,
          enrolled_count: classItem.enrollments[0]?.count || 0
        })) || [],
        enrolled_count: data.classes?.reduce((total: number, classItem: any) => 
          total + (classItem.enrollments[0]?.count || 0), 0) || 0
      };

      setCourseData(courseWithDetails);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusColors = {
      'Đang mở': 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md',
      'Đang bắt đầu': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md',
      'Kết thúc': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-md'
    };

    const colorClass = status ? statusColors[status as keyof typeof statusColors] || statusColors['Kết thúc'] : statusColors['Kết thúc'];

    return (
      <Badge className={`${colorClass} px-3 py-1 text-sm font-medium`}>
        {status || 'Không xác định'}
      </Badge>
    );
  };

  const handleGoBack = () => {
    const tab = searchParams.get('tab');
    if (tab === 'courses') {
      navigate('/admin', { state: { activeTab: 'courses' } });
    } else {
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">Không tìm thấy khóa học</CardTitle>
            <CardDescription className="text-red-100">
              Khóa học không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <Button onClick={() => navigate('/admin')} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-orange-50 border-orange-200 text-orange-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Chi tiết khóa học
                </h1>
                <p className="text-sm text-gray-600">Thông tin chi tiết và thống kê</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header Card */}
        <Card className="mb-8 shadow-xl border-0 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>
          
          <CardContent className="relative px-8 pb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end space-y-6 lg:space-y-0 lg:space-x-8 -mt-16">
              {/* Course Image */}
              <div className="w-32 h-32 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden flex-shrink-0">
                {courseData.image_url ? (
                  <img
                    src={courseData.image_url}
                    alt={courseData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-orange-500" />
                  </div>
                )}
              </div>
              
              {/* Course Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{courseData.name}</h2>
                    <p className="text-lg text-gray-600 mt-1">{courseData.description || 'Không có mô tả'}</p>
                  </div>
                  {getStatusBadge(courseData.status)}
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Học viên</p>
                      <p className="text-xl font-bold text-gray-900">{courseData.enrolled_count}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lớp học</p>
                      <p className="text-xl font-bold text-gray-900">{courseData.classes?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thời lượng</p>
                      <p className="text-xl font-bold text-gray-900">{courseData.duration || 0} buổi</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Học phí</p>
                      <p className="text-xl font-bold text-gray-900">
                        {courseData.price ? `${courseData.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Classes List */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Danh sách lớp học</span>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {courseData.classes?.length || 0} lớp
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {courseData.classes && courseData.classes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Tên lớp</TableHead>
                        <TableHead className="font-semibold">Lịch học</TableHead>
                        <TableHead className="font-semibold">Trạng thái</TableHead>
                        <TableHead className="font-semibold text-center">Học viên</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseData.classes.map((classItem) => (
                        <TableRow 
                          key={classItem.id}
                          className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => navigate(`/admin/class/${classItem.id}?tab=courses`)}
                        >
                          <TableCell className="font-medium">{classItem.name}</TableCell>
                          <TableCell>{classItem.schedule || '-'}</TableCell>
                          <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              {classItem.enrolled_count} học viên
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Chưa có lớp học nào</p>
                    <p className="text-gray-400">Hãy tạo lớp học đầu tiên cho khóa học này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Course Information */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Thông tin khóa học</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Thời lượng</span>
                    <span className="font-semibold">{courseData.duration ? `${courseData.duration} buổi` : 'Chưa xác định'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Học phí</span>
                    <span className="font-semibold">
                      {courseData.price ? `${courseData.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Trạng thái</span>
                    {getStatusBadge(courseData.status)}
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Tổng học viên</span>
                    <span className="font-semibold text-blue-600">{courseData.enrolled_count}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-500">Số lớp học</span>
                    <span className="font-semibold text-green-600">{courseData.classes?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Thời gian</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Ngày tạo</p>
                    <p className="text-gray-900 font-medium">{formatDateTime(courseData.created_at)}</p>
                  </div>
                  
                  {courseData.updated_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Cập nhật lần cuối</p>
                      <p className="text-gray-900 font-medium">{formatDateTime(courseData.updated_at)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
