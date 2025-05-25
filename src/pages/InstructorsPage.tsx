
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Instructor {
  id: string;
  fullname: string;
  email: string;
  avatar_url: string | null;
  age: number | null;
}

interface Course {
  id: string;
  instructor_id: string;
  level: 'basic' | 'intermediate' | 'advance';
}

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const levelMap = {
    basic: 'Cơ bản',
    intermediate: 'Trung cấp',
    advance: 'Nâng cao'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [instructorsRes, coursesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'teacher'),
        supabase
          .from('courses')
          .select('id, instructor_id, level')
      ]);

      if (instructorsRes.error) throw instructorsRes.error;
      if (coursesRes.error) throw coursesRes.error;

      setInstructors(instructorsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInstructorsByLevel = (level: string) => {
    const instructorIds = courses
      .filter(course => course.level === level)
      .map(course => course.instructor_id);
    
    return instructors.filter(instructor => 
      instructorIds.includes(instructor.id)
    );
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Đang tải giảng viên...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tất cả giảng viên</h1>
          <p className="text-xl text-gray-600">
            Khám phá đội ngũ giảng viên được phân loại theo mức độ khóa học
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basic">Cơ bản</TabsTrigger>
            <TabsTrigger value="intermediate">Trung cấp</TabsTrigger>
            <TabsTrigger value="advance">Nâng cao</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getInstructorsByLevel('basic').map((instructor) => (
                <Card key={instructor.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative overflow-hidden">
                    <img
                      src={instructor.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                      alt={instructor.fullname}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {levelMap.basic}
                    </div>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-gray-900">{instructor.fullname}</CardTitle>
                    <CardDescription className="text-gray-600">
                      Giảng viên chuyên nghiệp
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Email: {instructor.email}
                    </p>
                    {instructor.age && (
                      <p className="text-sm text-gray-500">
                        Tuổi: {instructor.age}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intermediate">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getInstructorsByLevel('intermediate').map((instructor) => (
                <Card key={instructor.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative overflow-hidden">
                    <img
                      src={instructor.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                      alt={instructor.fullname}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {levelMap.intermediate}
                    </div>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-gray-900">{instructor.fullname}</CardTitle>
                    <CardDescription className="text-gray-600">
                      Giảng viên chuyên nghiệp
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Email: {instructor.email}
                    </p>
                    {instructor.age && (
                      <p className="text-sm text-gray-500">
                        Tuổi: {instructor.age}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advance">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getInstructorsByLevel('advance').map((instructor) => (
                <Card key={instructor.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative overflow-hidden">
                    <img
                      src={instructor.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                      alt={instructor.fullname}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {levelMap.advance}
                    </div>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-gray-900">{instructor.fullname}</CardTitle>
                    <CardDescription className="text-gray-600">
                      Giảng viên chuyên nghiệp
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Email: {instructor.email}
                    </p>
                    {instructor.age && (
                      <p className="text-sm text-gray-500">
                        Tuổi: {instructor.age}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default InstructorsPage;
