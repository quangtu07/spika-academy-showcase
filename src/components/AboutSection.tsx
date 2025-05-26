import React from 'react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCountAnimation } from '@/hooks/useCountAnimation';

const AboutSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>(0.3);
  
  const years = useCountAnimation(10, statsVisible, 2000, '+');
  const students = useCountAnimation(1000, statsVisible, 2500, '+');
  const teachers = useCountAnimation(50, statsVisible, 2200, '+');
  const satisfaction = useCountAnimation(95, statsVisible, 2300, '%');

  return (
    <section className="py-20 bg-gray-50 font-roboto" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
            sectionVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <div className={`transition-all duration-1000 delay-200 ${
            sectionVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-10'
          }`}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Về trung tâm <span className="text-primary-600">Spika</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Spika là trung tâm đào tạo MC hàng đầu với hơn 10 năm kinh nghiệm trong lĩnh vực 
              đào tạo nghệ thuật dẫn chương trình. Chúng tôi tự hào là nơi ươm mầm và phát triển 
              tài năng cho hàng nghìn học viên trên khắp cả nước.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Với đội ngũ giảng viên giàu kinh nghiệm, phương pháp giảng dạy hiện đại và cơ sở 
              vật chất tiêu chuẩn quốc tế, Spika cam kết mang đến cho học viên những kiến thức 
              và kỹ năng cần thiết để thành công trong nghề MC.
            </p>
            <div 
              ref={statsRef}
              className="grid grid-cols-2 gap-6 mb-8"
            >
              <div className={`text-center transition-all duration-700 delay-500 ${
                statsVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-5 scale-95'
              }`}>
                <div className="text-3xl font-bold text-primary-600 mb-2">{years}</div>
                <div className="text-gray-600">Năm kinh nghiệm</div>
              </div>
              <div className={`text-center transition-all duration-700 delay-700 ${
                statsVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-5 scale-95'
              }`}>
                <div className="text-3xl font-bold text-primary-600 mb-2">{students}</div>
                <div className="text-gray-600">Học viên đã tốt nghiệp</div>
              </div>
              <div className={`text-center transition-all duration-700 delay-900 ${
                statsVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-5 scale-95'
              }`}>
                <div className="text-3xl font-bold text-primary-600 mb-2">{teachers}</div>
                <div className="text-gray-600">Giảng viên chuyên nghiệp</div>
              </div>
              <div className={`text-center transition-all duration-700 delay-1100 ${
                statsVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-5 scale-95'
              }`}>
                <div className="text-3xl font-bold text-primary-600 mb-2">{satisfaction}</div>
                <div className="text-gray-600">Học viên hài lòng</div>
              </div>
            </div>
            <Button className={`bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 transition-all duration-700 delay-1300 ${
              statsVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-5'
            }`}>
              Tìm hiểu thêm
            </Button>
          </div>
          <div className={`relative transition-all duration-1000 delay-400 ${
            sectionVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-10'
          }`}>
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Lớp học tại Spika"
              className="rounded-lg shadow-xl"
            />
            <div className={`absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-6 max-w-xs transition-all duration-700 delay-800 ${
              sectionVisible 
                ? 'opacity-100 translate-y-0 rotate-0' 
                : 'opacity-0 translate-y-5 -rotate-3'
            }`}>
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
