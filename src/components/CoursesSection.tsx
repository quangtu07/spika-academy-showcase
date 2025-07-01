import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Star, Clock, DollarSign, BookOpen, Users, ArrowRight, Eye } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  image_url: string;
  duration: number;
  price: number;
}

const CoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Refs for scroll reveal
  const titleRef = useScrollReveal({ threshold: 0.2 });
  const courseRefs = [
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' })
  ];
  const buttonRef = useScrollReveal({ threshold: 0.2 });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .limit(3);

      if (error) throw error;

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#02458b] mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Đang tải khóa học...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto relative overflow-hidden" id="courses">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#02458b] rounded-2xl mb-6 shadow-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-[#02458b] mb-6">
            Khóa học nổi bật
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cùng con khám phá khóa học ưng ý, kiến tạo hành trang vững chắc cho tương lai rạng rỡ!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              ref={courseRefs[index]}
              className="reveal reveal-fade-up h-full"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:transform hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  <img
                    src={course.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                    alt={course.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <Star className="h-6 w-6 text-yellow-500 fill-current" />
                    </div>
                  </div>
                </div>
                
                <CardHeader className="flex-grow bg-gradient-to-br from-white to-gray-50/50 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#02458b]"></div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#02458b] transition-colors duration-300">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="mt-auto bg-white/80 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-8 h-8 bg-[#1294fb] rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Thời gian</div>
                        <div className="font-semibold">{course.duration} buổi</div>
                      </div>
                    </div>
                    
                    {course.price && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-8 h-8 bg-[#ffc418] rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Học phí</div>
                          <div className="font-semibold">
                            {course.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Xem chi tiết</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div ref={buttonRef} className="text-center reveal reveal-fade-up">
          <Button 
            onClick={handleViewAllCourses}
            className="bg-[#02458b] hover:bg-[#02458b]/90 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 group"
          >
            <span className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Xem tất cả khóa học</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
