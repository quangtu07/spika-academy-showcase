import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Image } from 'lucide-react';
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
      'Đang mở': 'bg-green-100 text-green-800',
      'Đang bắt đầu': 'bg-blue-100 text-blue-800',
      'Kết thúc': 'bg-gray-100 text-gray-800'
    };

    const colorClass = status ? statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {status || 'Không xác định'}
      </span>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Không tìm thấy khóa học</CardTitle>
            <CardDescription>
              Khóa học không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/admin')} className="w-full">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{courseData.name}</h1>
                  <p className="text-sm text-gray-600">Chi tiết khóa học</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Thông tin khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="space-y-4">
                    {courseData.image_url ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <img
                          src={courseData.image_url}
                          alt={courseData.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Mô tả:</strong> {courseData.description || 'Không có'}</div>
                    <div><strong>Thời lượng:</strong> {courseData.duration ? `${courseData.duration} buổi` : 'Chưa xác định'}</div>
                    <div><strong>Học phí:</strong> {courseData.price ? `${courseData.price.toLocaleString('vi-VN')}đ` : 'Chưa xác định'}</div>
                    <div><strong>Trạng thái:</strong> {getStatusBadge(courseData.status)}</div>
                    <div><strong>Số học viên:</strong> {courseData.enrolled_count}</div>
                    <div><strong>Ngày tạo:</strong> {formatDateTime(courseData.created_at)}</div>
                    <div><strong>Lần cập nhật cuối:</strong> {courseData.updated_at ? formatDateTime(courseData.updated_at) : 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classes List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách lớp học ({courseData.classes?.length || 0})</CardTitle>
              <CardDescription>Tất cả các lớp học thuộc khóa học này</CardDescription>
            </CardHeader>
            <CardContent>
              {courseData.classes && courseData.classes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên lớp</TableHead>
                      <TableHead>Lịch học</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Học viên</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData.classes.map((classItem) => (
                      <TableRow 
                        key={classItem.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/admin/class/${classItem.id}?tab=courses`)}
                      >
                        <TableCell className="font-medium">{classItem.name}</TableCell>
                        <TableCell>{classItem.schedule || '-'}</TableCell>
                        <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{classItem.enrolled_count}</span>
                            <span className="text-gray-500">học viên</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lớp học nào được tạo cho khóa học này
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage; 