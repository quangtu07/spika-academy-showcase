import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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
      title: "Ươm mầm bản lĩnh",
      title2: "Bứt phá tương lai",
      subtitle: "Future Wings Academy - Trang bị kỹ năng mềm vượt trội, giúp con bạn tự tin học tập, giao tiếp và tỏa sáng",
      cta: "Đăng ký ngay",
      action: handleRegistration
    },
    {
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Ươm mầm bản lĩnh",
      title2: "Bứt phá tương lai",
      subtitle: "Future Wings Academy - Trang bị kỹ năng mềm vượt trội, giúp con bạn tự tin học tập, giao tiếp và tỏa sáng",
      cta: "Đăng ký ngay",
      action: handleRegistration
    },
    {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      title: "Ươm mầm bản lĩnh",
      title2: "Bứt phá tương lai",
      subtitle: "Future Wings Academy - Trang bị kỹ năng mềm vượt trội, giúp con bạn tự tin học tập, giao tiếp và tỏa sáng",
      cta: "Đăng ký ngay",
      action: handleRegistration
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden font-roboto" id="home">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="h-full bg-gradient-to-b from-black/40 via-black/50 to-black/60 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                {/* Enhanced Badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 animate-fade-in">
                  <Star className="h-8 w-8 text-white" />
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-white via-white to-purple-200 bg-clip-text text-transparent leading-tight">
                  {slide.title}
                </h1>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-white via-white to-purple-200 bg-clip-text text-transparent leading-tight">
                  {slide.title2}
                </h2>
                <p className="text-base md:text-lg mb-8 animate-fade-in animation-delay-200 text-gray-100 leading-relaxed">
                  {slide.subtitle}
                </p>
                
                {/* Enhanced Gradient Button */}
                <Button 
                  onClick={slide.action}
                  className="group relative overflow-hidden bg-[#02458b] hover:bg-[#02458b]/90 text-white px-10 py-4 text-lg font-semibold shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in animation-delay-400 border-0 rounded-2xl"
                >
                  {/* Animated background overlay */}
                  <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center space-x-3">
                    <Star className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>{slide.cta}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Enhanced Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentSlide 
                ? 'w-8 h-3 bg-[#02458b] rounded-full shadow-lg' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/70 rounded-full hover:scale-110'
            }`}
          >
            {index === currentSlide && (
              <div className="absolute inset-0 bg-[#02458b]/60 rounded-full blur-sm opacity-60"></div>
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Navigation arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-purple-500/80 hover:to-indigo-500/80 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white hover:bg-gradient-to-r hover:from-purple-500/80 hover:to-indigo-500/80 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default HeroCarousel;
