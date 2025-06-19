import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, DollarSign, Star, Users, Phone, Mail, MapPin, Calendar, Award, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';

interface Course {
  id: string;
  name: string;
  description: string;
  image_url: string;
  duration: number;
  price: number;
  status: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
  created_at: string;
  updated_at: string;
}

const CourseDetailPublicPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin khóa học",
        variant: "destructive",
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'Đang mở':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Đang bắt đầu':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Kết thúc':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-roboto flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-roboto">
        <Navbar />
        <div className="pt-32 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
            <Button onClick={() => navigate('/courses')}>
              Quay lại danh sách khóa học
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-roboto">
      <Navbar />
      
      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/courses')}
            className="mb-6 hover:bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách khóa học
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header */}
              <Card className="overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border-2 border-white/60">
                <div className="relative">
                  <img
                    src={course.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                    alt={course.name}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className={`mb-2 ${getStatusColor(course.status)}`}>
                      {course.status}
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {course.name}
                    </h1>
                  </div>
                </div>
              </Card>

              {/* Course Description */}
              <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-2 border-white/60">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center">
                    <BookOpen className="h-6 w-6 mr-3 text-purple-600" />
                    Mô tả khóa học
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {course.description || "Khóa học chưa có mô tả chi tiết."}
                  </p>
                </CardContent>
              </Card>

              {/* Course Features */}
              <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-2 border-white/60">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center">
                    <Award className="h-6 w-6 mr-3 text-purple-600" />
                    Điểm nổi bật
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Phương pháp hiện đại</div>
                        <div className="text-sm text-gray-600">Giảng dạy chuyên nghiệp</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Lớp học nhỏ</div>
                        <div className="text-sm text-gray-600">Tương tác tốt nhất</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Chứng chỉ</div>
                        <div className="text-sm text-gray-600">Sau khi hoàn thành</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Linh hoạt</div>
                        <div className="text-sm text-gray-600">Thời gian học phù hợp</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Info */}
              <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-2 border-white/60 sticky top-8">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl">Thông tin khóa học</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Thời lượng</div>
                        <div className="font-bold text-gray-900">{course.duration} buổi học</div>
                      </div>
                    </div>
                  </div>

                  {course.price && (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Học phí</div>
                          <div className="font-bold text-green-600 text-lg">
                            {course.price.toLocaleString('vi-VN')} VNĐ
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Trạng thái</div>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group text-lg py-6"
                    onClick={() => setIsRegistrationModalOpen(true)}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="h-5 w-5" />
                      <span>Liên hệ tư vấn ngay</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-2 border-white/60">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-purple-600" />
                    Liên hệ trực tiếp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Hotline</div>
                      <div className="font-semibold text-gray-900">0123 456 789</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-semibold text-gray-900">info@futurewings.edu.vn</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm text-gray-600">Địa chỉ</div>
                      <div className="font-semibold text-gray-900">123 Đường ABC, Quận XYZ, TP.HCM</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <RegistrationModal 
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </div>
  );
};

export default CourseDetailPublicPage; 