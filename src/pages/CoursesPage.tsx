import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Clock, DollarSign, Star, Users, ArrowRight, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  name: string;
  description: string;
  image_url: string;
  duration: number;
  price: number;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

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

  const handleBackToHome = () => {
    navigate('/');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto">
      <Navbar />
      
      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Enhanced Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#02458b] rounded-2xl mb-6 shadow-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-[#02458b] mb-6 leading-tight">
              Tất cả khóa học
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Khám phá các khóa học MC chất lượng cao với phương pháp giảng dạy hiện đại
            </p>
          </div>

          {/* Enhanced Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Card key={course.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl relative h-full flex flex-col">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#02458b]"></div>
                
                <div className="relative overflow-hidden">
                  <img
                    src={course.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                    alt={course.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-6 w-6 text-yellow-500 fill-current" />
                  </div>
                </div>
                
                <CardHeader className="flex-grow bg-gradient-to-br from-white to-gray-50/50 relative p-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-[#02458b] transition-colors duration-300 mb-3">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed text-lg text-justify">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="mt-auto bg-white/80 backdrop-blur-sm p-6">
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

                  {/* Bottom gradient line */}
                  <div className="w-full h-1 bg-[#02458b] rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Empty State */}
          {courses.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl mb-6 shadow-xl">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Chưa có khóa học nào
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                Các khóa học sẽ được cập nhật sớm nhất có thể.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
