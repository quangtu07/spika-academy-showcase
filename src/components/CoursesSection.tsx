
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface Course {
  id: string;
  name: string;
  description: string;
  image_url: string;
  duration: number;
  price: number;
}

interface CoursesSectionProps {
  onOpenRegistrationModal: () => void;
}

const CoursesSection = ({ onOpenRegistrationModal }: CoursesSectionProps) => {
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
      <section className="py-20 bg-gray-50 font-roboto" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Đang tải khóa học...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 font-roboto" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Khóa học nổi bật</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn khóa học phù hợp với mục tiêu của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              ref={courseRefs[index]}
              className="reveal reveal-fade-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={course.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                    alt={course.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">{course.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      Thời gian: {course.duration} buổi
                    </span>
                    {course.price && (
                      <span className="text-lg font-bold text-primary-600">
                        {course.price.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                    onClick={onOpenRegistrationModal}
                  >
                    Liên hệ tư vấn
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div ref={buttonRef} className="text-center mt-12 reveal reveal-fade-up">
          <Button 
            onClick={handleViewAllCourses}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg hover-lift"
          >
            Xem tất cả khóa học
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
