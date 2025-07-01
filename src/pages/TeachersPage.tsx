import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Award, Star, MessageCircle, ArrowRight } from 'lucide-react';
import RegistrationModal from '@/components/RegistrationModal';

interface Teacher {
  id: string;
  fullname: string;
  info: string;
  avatar_url: string;
}

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

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
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-[#02458b] mb-6 leading-tight">
              Đội Ngũ Giảng Viên
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Gặp gỡ đội ngũ giảng viên giàu kinh nghiệm và tận tâm của chúng tôi
            </p>
            
            {/* Consultation Button */}
            <Button 
              onClick={() => setIsRegistrationModalOpen(true)}
              className="group bg-[#02458b] hover:bg-[#02458b]/90 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <span className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">Liên hệ tư vấn miễn phí</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </div>

          {/* Enhanced Teachers Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#02458b] absolute top-0 left-0"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map((teacher, index) => (
                <Card key={teacher.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-2 border-white/60 hover:border-[#02458b]/20 shadow-xl relative h-full flex flex-col">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#02458b]"></div>
                  
                  <div className="relative overflow-hidden">
                    {teacher.avatar_url ? (
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.fullname}
                        className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-blue-100 via-indigo-100 to-slate-100 flex items-center justify-center relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#02458b]/10 to-blue-500/10"></div>
                        <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/30 rounded-full blur-lg"></div>
                        
                        <div className="relative z-10 w-24 h-24 bg-[#02458b] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white text-2xl font-bold">
                            {teacher.fullname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Floating badge */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 text-[#02458b]" />
                    </div>
                  </div>
                  
                  <CardContent className="p-8 relative flex-grow flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#02458b] transition-colors duration-300">
                      {teacher.fullname}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg flex-grow text-justify">
                      {teacher.info || 'Giảng viên giàu kinh nghiệm trong lĩnh vực giáo dục với phương pháp giảng dạy hiện đại và hiệu quả.'}
                    </p>
                    
                    {/* Bottom gradient line */}
                    <div className="w-full h-1 bg-[#02458b] rounded-full mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Enhanced Empty State */}
          {!loading && teachers.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl mb-6 shadow-xl">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Chưa có giảng viên nào
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                Thông tin giảng viên sẽ được cập nhật sớm nhất có thể.
              </p>
            </div>
          )}
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

export default TeachersPage;
