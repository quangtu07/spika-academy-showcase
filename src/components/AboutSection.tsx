
import React from 'react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AboutSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();

  return (
    <section className="py-20 bg-gray-50 font-roboto" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={sectionRef} className={`transition-all duration-1000 ${sectionVisible ? 'animate-fade-in opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className={`text-4xl font-bold text-gray-900 mb-6 transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{transitionDelay: sectionVisible ? '200ms' : '0ms'}}>
              Về trung tâm <span className="text-primary-600">Spika</span>
            </h2>
            <p className={`text-lg text-gray-600 mb-6 leading-relaxed transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{transitionDelay: sectionVisible ? '400ms' : '0ms'}}>
              Spika là trung tâm đào tạo MC hàng đầu với hơn 10 năm kinh nghiệm trong lĩnh vực 
              đào tạo nghệ thuật dẫn chương trình. Chúng tôi tự hào là nơi ươm mầm và phát triển 
              tài năng cho hàng nghìn học viên trên khắp cả nước.
            </p>
            <p className={`text-lg text-gray-600 mb-8 leading-relaxed transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{transitionDelay: sectionVisible ? '600ms' : '0ms'}}>
              Với đội ngũ giảng viên giàu kinh nghiệm, phương pháp giảng dạy hiện đại và cơ sở 
              vật chất tiêu chuẩn quốc tế, Spika cam kết mang đến cho học viên những kiến thức 
              và kỹ năng cần thiết để thành công trong nghề MC.
            </p>
            <div ref={statsRef} className={`grid grid-cols-2 gap-6 mb-8 transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: statsVisible ? '200ms' : '0ms'}}>
              {[
                { number: '10+', label: 'Năm kinh nghiệm' },
                { number: '1000+', label: 'Học viên đã tốt nghiệp' },
                { number: '50+', label: 'Giảng viên chuyên nghiệp' },
                { number: '95%', label: 'Học viên hài lòng' }
              ].map((stat, index) => (
                <div key={index} className={`text-center group hover:scale-105 transition-all duration-500 ${statsVisible ? 'animate-bounce' : ''}`} style={{animationDelay: statsVisible ? `${400 + index * 100}ms` : '0ms', animationDuration: '1s', animationIterationCount: '1'}}>
                  <div className="text-3xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            <Button className={`bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 hover:scale-105 transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{transitionDelay: sectionVisible ? '800ms' : '0ms'}}>
              Tìm hiểu thêm
            </Button>
          </div>
          <div className={`relative transition-all duration-1000 ${sectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`} style={{transitionDelay: sectionVisible ? '300ms' : '0ms'}}>
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Lớp học tại Spika"
              className="rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-500 hover:scale-105"
            />
            <div className={`absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-6 max-w-xs hover:scale-105 transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{transitionDelay: sectionVisible ? '1000ms' : '0ms'}}>
              <h4 className="font-bold text-gray-900 mb-2">Môi trường học tập chuyên nghiệp</h4>
              <p className="text-sm text-gray-600">
                Trang thiết bị hiện đại, âm thanh ánh sáng chuẩn studio
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
