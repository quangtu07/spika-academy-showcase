
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import AboutSection from '@/components/AboutSection';
import CoursesSection from '@/components/CoursesSection';
import CommitmentsSection from '@/components/CommitmentsSection';
import ActivitiesSection from '@/components/ActivitiesSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';
import { 
  Users, 
  BookOpen, 
  Award, 
  GraduationCap,
  Clock,
  Star,
  Target,
  TrendingUp
} from 'lucide-react';

const Index = () => {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Quick stats for modern dashboard feel
  const quickStats = [
    {
      title: "Học viên tốt nghiệp",
      value: "1,200+",
      change: "+15%",
      icon: GraduationCap,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Khóa học đang mở",
      value: "24",
      change: "+3",
      icon: BookOpen,
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Giảng viên",
      value: "50+",
      change: "+8",
      icon: Users,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Tỷ lệ hài lòng",
      value: "98%",
      change: "+2%",
      icon: Star,
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Đăng ký ngay",
      description: "Bắt đầu hành trình MC chuyên nghiệp",
      icon: Target,
      action: () => setIsRegistrationModalOpen(true),
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Xem khóa học",
      description: "Khám phá các khóa học phù hợp",
      icon: BookOpen,
      action: () => {
        const section = document.querySelector('#courses');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      },
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Hoạt động",
      description: "Xem các hoạt động nổi bật",
      icon: Award,
      action: () => {
        const section = document.querySelector('#activities');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      },
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section with Modern Overlay */}
      <div className="relative">
        <HeroCarousel onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10 pointer-events-none" />
      </div>

      {/* Dashboard-style Quick Stats */}
      <section className="py-16 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Bắt đầu ngay hôm nay
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khởi đầu hành trình MC chuyên nghiệp của bạn với Spika
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {quickActions.map((action, index) => (
              <Card key={index} className="group cursor-pointer bg-white/90 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${action.gradient}`} />
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={action.action}
                    className={`w-full bg-gradient-to-r ${action.gradient} hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    Khám phá ngay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Sections with Modern Backgrounds */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/50 pointer-events-none" />
        <AboutSection />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-purple-50/50 pointer-events-none" />
        <CoursesSection onOpenRegistrationModal={() => setIsRegistrationModalOpen(true)} />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-blue-50/50 pointer-events-none" />
        <CommitmentsSection />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-green-50/50 pointer-events-none" />
        <TestimonialsSection />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-orange-50/50 pointer-events-none" />
        <ActivitiesSection />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-gray-900 pointer-events-none" />
        <Footer />
      </div>

      <RegistrationModal 
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </div>
  );
};

export default Index;
