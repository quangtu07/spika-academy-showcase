
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Image, Clock, DollarSign, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminToolbar from '@/components/admin/AdminToolbar';

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image_url?: string;
  status?: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
  detail_lessons?: string;
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
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
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
          id,
          name,
          description,
          price,
          duration,
          image_url,
          status,
          detail_lessons,
          created_at,
          updated_at,
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
    const statusConfig = {
      'Đang mở': { 
        variant: 'default' as const, 
        className: 'bg-green-100 text-green-800 border-green-200 shadow-sm',
        icon: '🟢'
      },
      'Đang bắt đầu': { 
        variant: 'secondary' as const, 
        className: 'bg-blue-100 text-blue-800 border-blue-200 shadow-sm',
        icon: '🔵'
      },
      'Kết thúc': { 
        variant: 'outline' as const, 
        className: 'bg-gray-100 text-gray-800 border-gray-200 shadow-sm',
        icon: '⚪'
      }
    };

    // Default config for undefined or unknown status
    const defaultConfig = statusConfig['Kết thúc'];
    
    // Get config based on status, fallback to default if not found
    const config = status && statusConfig[status as keyof typeof statusConfig] 
      ? statusConfig[status as keyof typeof statusConfig] 
      : defaultConfig;

    return (
      <Badge variant={config.variant} className={config.className}>
        <span className="mr-1">{config.icon}</span>
        {status || 'Không xác định'}
      </Badge>
    );
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải thông tin</h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600 text-xl">Không tìm thấy khóa học</CardTitle>
            <CardDescription className="text-gray-600">
              Khóa học không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <Button onClick={() => navigate('/admin')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminToolbar 
        title={courseData.name} 
        subtitle="Chi tiết khóa học" 
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Course Info Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2"></div>
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Thông tin khóa học</CardTitle>
                <CardDescription className="text-gray-600">Chi tiết và thông số của khóa học</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                {courseData.image_url ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={courseData.image_url}
                        alt={courseData.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <Image className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Chưa có hình ảnh</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Mô tả</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{courseData.description || 'Chưa có mô tả'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-600">Thời lượng</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {courseData.duration ? `${courseData.duration} buổi` : 'Chưa xác định'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-600">Học phí</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {courseData.price ? `${courseData.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Trạng thái</span>
                      </div>
                      {getStatusBadge(courseData.status)}
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-600">Học viên</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{courseData.enrolled_count}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span><strong>Ngày tạo:</strong> {formatDateTime(courseData.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span><strong>Cập nhật cuối:</strong> {courseData.updated_at ? formatDateTime(courseData.updated_at) : 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Lessons Section */}
        {courseData.detail_lessons && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2"></div>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Chi tiết chương trình học</CardTitle>
                  <CardDescription className="text-gray-600">Nội dung các buổi học trong khóa học</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <div className="prose prose-lg max-w-none text-gray-700">
                  <div className="whitespace-pre-line leading-relaxed">
                    {courseData.detail_lessons}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classes List */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2"></div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    Danh sách lớp học ({courseData.classes?.length || 0})
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Tất cả các lớp học thuộc khóa học này
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {courseData.classes && courseData.classes.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <TableHead className="font-semibold text-gray-900">Tên lớp</TableHead>
                      <TableHead className="font-semibold text-gray-900">Lịch học</TableHead>
                      <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Học viên</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData.classes.map((classItem, index) => (
                      <TableRow 
                        key={classItem.id}
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border-b border-gray-100"
                        onClick={() => navigate(`/admin/class/${classItem.id}?tab=courses`)}
                      >
                        <TableCell className="font-medium text-gray-900 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <span>{classItem.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 py-4">
                          {classItem.schedule || <span className="text-gray-400 italic">Chưa có lịch</span>}
                        </TableCell>
                        <TableCell className="py-4">{getStatusBadge(classItem.status)}</TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900">{classItem.enrolled_count}</span>
                              <span className="text-gray-500 text-sm ml-1">học viên</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lớp học</h3>
                <p className="text-gray-500">Chưa có lớp học nào được tạo cho khóa học này</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetailPage;
