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
  detail_lessons: string;
  student_target?: string;
  created_at: string;
  updated_at: string;
}

const PublicCourseDetailPage = () => {
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

      // Try to fetch student_target separately to handle potential missing column
      let studentTarget = '';
      try {
        const { data: studentTargetData } = await supabase
          .from('courses')
          .select('student_target')
          .eq('id', courseId)
          .single();
        studentTarget = (studentTargetData as any)?.student_target || '';
      } catch (error) {
        // Column might not exist yet, use empty string as default
        console.log('student_target column not found, using empty string');
      }

      setCourse({
        ...data,
        student_target: studentTarget
      });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#02458b] absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto">
      <Navbar />
      
      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#02458b]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1294fb]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Back Button
          <Button
            variant="ghost"
            onClick={() => navigate('/courses')}
            className="mb-6 hover:bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách khóa học
          </Button> */}

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
                    <BookOpen className="h-6 w-6 mr-3 text-[#02458b]" />
                    Mục tiêu khóa học
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Description */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed">
                      {course.description || "Khóa học MC chuyên nghiệp với phương pháp giảng dạy hiện đại, giúp học viên phát triển kỹ năng dẫn chương trình một cách tự tin và chuyên nghiệp."}
                    </p>
                  </div>

                  {/* Student Target */}
                  {course.student_target && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-[#059669] rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">Đối tượng học viên</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {course.student_target}
                      </p>
                    </div>
                  )}




                </CardContent>
              </Card>



              {/* Detailed Lessons */}
              {course.detail_lessons && (
                <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-2 border-white/60">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 flex items-center">
                      <BookOpen className="h-6 w-6 mr-3 text-[#02458b]" />
                      Chi tiết chương trình học
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.detail_lessons.split(/Buổi \d+:/).filter(lesson => lesson.trim()).map((lesson, index) => {
                        // Tìm số buổi học từ chuỗi gốc
                        const lessonMatches = course.detail_lessons.match(/Buổi \d+:/g);
                        const lessonNumber = lessonMatches ? lessonMatches[index]?.replace('Buổi ', '').replace(':', '') : index + 1;
                        
                        // Tách tiêu đề và mô tả
                        const parts = lesson.trim().split('\n');
                        const title = parts[0]?.trim().replace(/^[-–—]\s*/, '') || '';
                        const description = parts.slice(1).join('\n').trim() || parts[0]?.trim() || '';
                        
                        if (!title) return null;
                        
                        return (
                          <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 w-12 h-12 bg-[#02458b] rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">{lessonNumber}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                  Buổi {lessonNumber}: {title}
                                </h4>
                                <div className="text-gray-700 leading-relaxed">
                                  {description.split('\n').map((line, lineIndex) => {
                                    const trimmedLine = line.trim();
                                    if (!trimmedLine) return null;
                                    
                                    // Kiểm tra nếu dòng bắt đầu bằng dấu gạch ngang
                                    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                                      return (
                                        <div key={lineIndex} className="flex items-start mt-2">
                                          <div className="w-2 h-2 bg-[#02458b] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                          <span>{trimmedLine.replace(/^[-•]\s*/, '')}</span>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                                          {trimmedLine}
                                        </p>
                                      );
                                    }
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Info */}
              <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-2 border-white/60 sticky top-8">
                <CardHeader className="bg-[#02458b] text-white rounded-t-lg">
                  <CardTitle className="text-xl">Thông tin khóa học</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#1294fb] rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Thời lượng</div>
                        <div className="font-bold text-gray-900">{course.duration} buổi học</div>
                      </div>
                    </div>
                  </div>

                  {course.price && (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#ffc418] rounded-lg flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-gray-900" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Học phí</div>
                          <div className="font-bold text-[#ffc418] text-lg">
                            {course.price.toLocaleString('vi-VN')} VNĐ
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#02458b] rounded-lg flex items-center justify-center">
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
                    className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group text-lg py-6"
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
                    <Phone className="h-5 w-5 mr-2 text-[#02458b]" />
                    Liên hệ trực tiếp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {/* <Phone className="h-4 w-4 text-gray-600" /> */}
                    <div>
                      <div className="text-sm text-gray-600">Điện thoại</div>
                      <div className="font-semibold text-gray-900">0853326829</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {/* <Mail className="h-4 w-4 text-gray-600" /> */}
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-semibold text-gray-900">futurewings.academy@gmail.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {/* <MapPin className="h-4 w-4 text-gray-600" /> */}
                    <div>
                      <div className="text-sm text-gray-600">Địa chỉ</div>
                      <div className="font-semibold text-gray-900">SN 20, Ngõ 16, Trần Nhật Duật, Lê Hồng Phong, Phủ Lý, Hà Nam</div>
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

export default PublicCourseDetailPage; 
 