import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, GraduationCap, Star, ArrowRight, Sparkles } from 'lucide-react';
import RegistrationModal from './RegistrationModal';

const AboutSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textRef = useScrollReveal({ threshold: 0.2 });
  const statsRef = useScrollReveal({ threshold: 0.2, rootMargin: '50px' });
  const imageRef = useScrollReveal({ threshold: 0.2 });

  const stats = [
    {
      icon: Award,
      number: "10+",
      label: "Năm kinh nghiệm",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: GraduationCap,
      number: "1000+",
      label: "Học viên đã tốt nghiệp",
      gradient: "from-[#1294fb] to-[#1294fb]"
    },
    {
      icon: Users,
      number: "50+",
      label: "Giảng viên chuyên nghiệp",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Star,
      number: "95%",
      label: "Học viên hài lòng",
      gradient: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto relative overflow-hidden" id="about">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-2xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Title Section */}
        <div ref={textRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#02458b] rounded-2xl mb-6 shadow-xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-5xl font-bold text-[#02458b] leading-tight mb-6">
            Về Future Wings Academy
            
          </h2>
          
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-lg text-justify">
              Tại Future Wings Academy, chúng tôi hiểu rõ từng giai đoạn phát triển độc đáo của 
              trẻ em và thanh thiếu niên từ 5 đến 16 tuổi. 
              Với chương trình được thiết kế linh hoạt, phương pháp giảng dạy tương tác sinh động, 
              cùng đội ngũ giáo viên tâm huyết và giàu kinh nghiệm am hiểu tâm lý lứa tuổi, chúng tôi tập trung phát triển các kỹ năng mềm cốt lõi như tư duy phản biện, khả năng thuyết trình tự tin và kỹ năng MC chuyên nghiệp. 
              </p>
              <p className="text-lg text-justify">
              Mục tiêu của chúng tôi là giúp mỗi học viên không chỉ tự tin thể hiện bản 
              thân trong học tập mà còn vững vàng thích nghi, 
              giao tiếp hiệu quả và thành công trong mọi môi trường sống và xã hội.
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="group bg-[#02458b] hover:bg-[#02458b]/90 text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">Đăng ký ngay</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>

          {/* Image Section */}
          <div ref={imageRef} className="relative reveal reveal-fade-right">
            <div className="relative group">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Lớp học tại Spika"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>

              {/* Floating Card */}
              <Card className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm shadow-2xl border-0 max-w-xs group-hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-[#1294fb] rounded-2xl flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Môi trường học tập</h4>
                      <p className="text-sm text-gray-600">chuyên nghiệp</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Trang thiết bị hiện đại, âm thanh ánh sáng chuẩn studio quốc tế
                  </p>
                  <div className="w-full h-1 bg-[#1294fb] rounded-full mt-4"></div>
                </CardContent>
              </Card>

              {/* Decorative Elements */}
              {/* <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-400/30 to-blue-400/30 rounded-full blur-lg"></div> */}
            </div>
          </div>
        </div>

        {/* Stats Grid - Full Width */}
        {/* <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6 reveal reveal-fade-up">
          {stats.map((stat, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">{stat.number}</div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                <div className={`w-full h-1 bg-gradient-to-r ${stat.gradient} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </CardContent>
            </Card>
          ))}
        </div> */}
      </div>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};

export default AboutSection;
