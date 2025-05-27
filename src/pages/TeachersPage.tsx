
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

interface Teacher {
  id: string;
  fullname: string;
  info: string;
  avatar_url: string;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname, info, avatar_url')
        .eq('role', 'teacher');

      if (error) {
        console.error('Error fetching teachers:', error);
        return;
      }

      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Đội Ngũ Giảng Viên
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gặp gỡ đội ngũ giảng viên giàu kinh nghiệm và tận tâm của chúng tôi
            </p>
          </div>

          {/* Teachers Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    {teacher.avatar_url ? (
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.fullname}
                        className="w-full h-80 object-cover"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {teacher.fullname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {teacher.fullname}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {teacher.info || 'Giảng viên giàu kinh nghiệm trong lĩnh vực giáo dục.'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && teachers.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có giảng viên nào
              </h3>
              <p className="text-gray-600">
                Thông tin giảng viên sẽ được cập nhật sớm nhất có thể.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeachersPage;
