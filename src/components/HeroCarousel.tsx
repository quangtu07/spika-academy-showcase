
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, ArrowRight } from 'lucide-react';

interface HeroCarouselProps {
  onOpenRegistrationModal: () => void;
}

const HeroCarousel = ({ onOpenRegistrationModal }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleRegistration = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenRegistrationModal();
  };

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Trở thành MC chuyên nghiệp",
      subtitle: "Khóa học đào tạo MC toàn diện từ cơ bản đến nâng cao",
      description: "Phát triển kỹ năng dẫn chương trình với đội ngũ giảng viên giàu kinh nghiệm",
      cta: "Đăng ký ngay",
      action: handleRegistration,
      gradient: "from-primary-600/90 via-purple-600/80 to-primary-700/90"
    },
    {
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Giảng viên kinh nghiệm",
      subtitle: "Đội ngũ giảng viên giàu kinh nghiệm và tâm huyết",
      description: "Học hỏi từ những chuyên gia hàng đầu trong lĩnh vực MC và truyền thông",
      cta: "Khám phá ngay",
      action: handleRegistration,
      gradient: "from-emerald-600/90 via-teal-600/80 to-cyan-700/90"
    },
    {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Học linh hoạt - Hiệu quả cao",
      subtitle: "Phương pháp học tập hiện đại, phù hợp với mọi đối tượng",
      description: "Lịch học linh hoạt, phương pháp giảng dạy tương tác và thực hành nhiều",
      cta: "Tham gia ngay",
      action: handleRegistration,
      gradient: "from-orange-600/90 via-amber-600/80 to-yellow-600/90"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[650px] md:h-[750px] overflow-hidden font-roboto" id="home">
      {/* Background slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
        >
          <div
            className="h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Enhanced gradient overlay */}
            <div className={`h-full bg-gradient-to-r ${slide.gradient} backdrop-blur-[0.5px]`}>
              <div className="h-full flex items-center justify-center relative">
                
                {/* Floating elements for visual appeal */}
                <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm animate-pulse" />
                <div className="absolute bottom-32 right-16 w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm animate-pulse animation-delay-1000" />
                
                {/* Main content */}
                <div className="text-center text-white max-w-5xl px-4 relative z-10">
                  {/* Badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-6 animate-fade-in">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    Spika MC Academy
                  </div>

                  {/* Title with enhanced animation */}
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in leading-tight">
                    <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                      {slide.title}
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xl md:text-3xl mb-4 animate-fade-in animation-delay-200 font-light">
                    {slide.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-lg md:text-xl mb-8 animate-fade-in animation-delay-300 text-white/90 max-w-3xl mx-auto">
                    {slide.description}
                  </p>

                  {/* Enhanced CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-500">
                    <Button 
                      onClick={slide.action}
                      size="lg"
                      className="relative overflow-hidden bg-white text-gray-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 group min-w-[200px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                      <span className="relative z-10 flex items-center">
                        {slide.cta}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </Button>

                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const section = document.querySelector('#about');
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="border-white/30 text-white hover:bg-white/10 backdrop-blur-md px-8 py-4 text-lg font-medium transition-all duration-300 group min-w-[200px]"
                    >
                      <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Enhanced navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group hover:scale-110 z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center group hover:scale-110 z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>

      {/* Enhanced indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentSlide 
                ? 'w-12 h-3 bg-white rounded-full' 
                : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-gradient-to-r from-white via-primary-200 to-purple-200 transition-all duration-1000 ease-linear"
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      {/* Floating stats cards */}
      <div className="absolute bottom-20 left-8 hidden lg:block z-20">
        <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-white text-sm mb-1">Học viên</div>
          <div className="text-white text-2xl font-bold">1,200+</div>
        </div>
      </div>

      <div className="absolute top-32 right-8 hidden lg:block z-20">
        <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-white text-sm mb-1">Khóa học</div>
          <div className="text-white text-2xl font-bold">24</div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
