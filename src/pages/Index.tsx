import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Award, Calendar, Star, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import AboutSection from '@/components/AboutSection';
import CoursesSection from '@/components/CoursesSection';
import CommitmentsSection from '@/components/CommitmentsSection';
import ActivitiesSection from '@/components/ActivitiesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';

const Index = () => {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const navigate = useNavigate();

  const statsData = [
    {
      title: "Học viên",
      value: "1000+",
      icon: <Users className="h-8 w-8 text-primary-600" />,
      description: "Học viên đã tốt nghiệp",
      trend: "+15%"
    },
    {
      title: "Khóa học",
      value: "20+",
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      description: "Khóa học chuyên nghiệp",
      trend: "+8%"
    },
    {
      title: "Giảng viên",
      value: "50+",
      icon: <Award className="h-8 w-8 text-yellow-600" />,
      description: "Giảng viên giàu kinh nghiệm",
      trend: "+12%"
    },
    {
      title: "Sự kiện",
      value: "200+",
      icon: <Calendar className="h-8 w-8 text-purple-600" />,
      description: "Sự kiện đã tổ chức",
      trend: "+25%"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <HeroCarousel onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thành tựu nổi bật</h2>
            <p className="text-lg text-gray-600">Con số thể hiện sự phát triển của Spika</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <p className="text-sm text-gray-600 mb-2">{stat.description}</p>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Khám phá ngay</h2>
            <p className="text-lg text-gray-600">Tìm hiểu về các khóa học và dịch vụ của chúng tôi</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer" 
                  onClick={() => navigate('/courses')}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl font-bold">Khóa học</CardTitle>
                <CardDescription>
                  Khám phá các khóa học đào tạo MC chuyên nghiệp
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  Xem khóa học
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate('/teachers')}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold">Giảng viên</CardTitle>
                <CardDescription>
                  Đội ngũ giảng viên giàu kinh nghiệm và tâm huyết
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  Xem giảng viên
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => setIsRegistrationModalOpen(true)}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-bold">Đăng ký tư vấn</CardTitle>
                <CardDescription>
                  Nhận tư vấn miễn phí về khóa học phù hợp
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">
                  Đăng ký ngay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Existing sections */}
      <AboutSection />
      <CoursesSection onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
      <CommitmentsSection />
      <TestimonialsSection />
      <ActivitiesSection />
      <Footer />
      
      <RegistrationModal 
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </div>
  );
};

export default Index;
