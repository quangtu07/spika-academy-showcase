
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Instructor {
  id: string;
  fullname: string;
  email: string;
  avatar_url: string | null;
  age: number | null;
  courses?: Course[];
}

interface Course {
  id: string;
  name: string;
  level: 'basic' | 'intermediate' | 'advance';
}

const InstructorsSection = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const levelMap = {
    basic: 'Cơ bản',
    intermediate: 'Trung cấp',
    advance: 'Nâng cao'
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          courses!courses_instructor_id_fkey(id, name, level)
        `)
        .eq('role', 'teacher')
        .limit(3);

      if (error) throw error;

      setInstructors(data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giảng viên",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllInstructors = () => {
    navigate('/instructors');
  };

  if (loading) {
    return (
      <section className="py-20 bg-white font-roboto" id="instructors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Đang tải giảng viên...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white font-roboto" id="instructors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Đội ngũ giảng viên</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Giảng viên giàu kinh nghiệm và tâm huyết với nghề
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <Card key={instructor.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative overflow-hidden">
                <img
                  src={instructor.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                  alt={instructor.fullname}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-gray-900">{instructor.fullname}</CardTitle>
                <CardDescription className="text-gray-600">
                  Giảng viên chuyên nghiệp
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {instructor.courses && instructor.courses.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Đang phụ trách:</p>
                    <div className="space-y-1">
                      {instructor.courses.map((course) => (
                        <div key={course.id} className="text-sm text-gray-600">
                          {course.name} ({levelMap[course.level]})
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Chưa phụ trách khóa học nào
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={handleViewAllInstructors}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg"
          >
            Xem tất cả giảng viên
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;
