
import React from 'react';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, GraduationCap, Star } from 'lucide-react';

const AboutSection = () => {
  const textRef = useScrollReveal({ threshold: 0.2 });
  const statsRef = useScrollReveal({ threshold: 0.2, rootMargin: '50px' });
  const imageRef = useScrollReveal({ threshold: 0.2 });

  const stats = [
    {
      icon: Award,
      number: "10+",
      label: "Năm kinh nghiệm",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: GraduationCap,
      number: "1000+",
      label: "Học viên đã tốt nghiệp",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Users,
      number: "50+",
      label: "Giảng viên chuyên nghiệp",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Star,
      number: "95%",
      label: "Học viên hài lòng",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 font-roboto relative overflow-hidden" id="about">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-primary-200 to-purple-300 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full blur-lg"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div ref={textRef} className="reveal reveal-fade-left space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 rounded-full border border-primary-100">
                <span className="text-primary-600 font-medium text-sm">✨ Về chúng tôi</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Về trung tâm{' '}
                <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Spika
                </span>
              </h2>
            </div>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-lg">
                Spika là trung tâm đào tạo MC hàng đầu với hơn 10 năm kinh nghiệm trong lĩnh vực 
                đào tạo nghệ thuật dẫn chương trình. Chúng tôi tự hào là nơi ươm mầm và phát triển 
                tài năng cho hàng nghìn học viên trên khắp cả nước.
              </p>
              <p className="text-lg">
                Với đội ngũ giảng viên giàu kinh nghiệm, phương pháp giảng dạy hiện đại và cơ sở 
                vật chất tiêu chuẩn quốc tế, Spika cam kết mang đến cho học viên những kiến thức 
                và kỹ năng cần thiết để thành công trong nghề MC.
              </p>
            </div>
            
            {/* Stats Grid */}
            <div ref={statsRef} className="grid grid-cols-2 gap-4 reveal reveal-fade-up">
              {stats.map((stat, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                    <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-4">
              <Button className="group bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 hover:from-primary-700 hover:via-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <span className="font-medium">Tìm hiểu thêm</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
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
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Card */}
              <Card className="absolute -bottom-8 -left-8 bg-white shadow-2xl border-0 max-w-xs group-hover:shadow-3xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
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
                </CardContent>
              </Card>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-60 blur-lg"></div>
              <div className="absolute top-1/2 -left-6 w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-50 blur-md"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
