
import React from 'react';
import { Button } from '@/components/ui/button';

const AboutSection = () => {
  return (
    <section className="py-20 bg-gray-50 font-roboto" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in animation-delay-200">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 animate-fade-in">
              Về trung tâm <span className="text-primary-600">Spika</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed animate-fade-in animation-delay-300">
              Spika là trung tâm đào tạo MC hàng đầu với hơn 10 năm kinh nghiệm trong lĩnh vực 
              đào tạo nghệ thuật dẫn chương trình. Chúng tôi tự hào là nơi ươm mầm và phát triển 
              tài năng cho hàng nghìn học viên trên khắp cả nước.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed animate-fade-in animation-delay-400">
              Với đội ngũ giảng viên giàu kinh nghiệm, phương pháp giảng dạy hiện đại và cơ sở 
              vật chất tiêu chuẩn quốc tế, Spika cam kết mang đến cho học viên những kiến thức 
              và kỹ năng cần thiết để thành công trong nghề MC.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8 animate-fade-in animation-delay-500">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">10+</div>
                <div className="text-gray-600">Năm kinh nghiệm</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">1000+</div>
                <div className="text-gray-600">Học viên đã tốt nghiệp</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">50+</div>
                <div className="text-gray-600">Giảng viên chuyên nghiệp</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">95%</div>
                <div className="text-gray-600">Học viên hài lòng</div>
              </div>
            </div>
            <Button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 animate-fade-in animation-delay-600 hover:scale-105 transition-all duration-300">
              Tìm hiểu thêm
            </Button>
          </div>
          <div className="relative animate-slide-in-right animation-delay-300">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Lớp học tại Spika"
              className="rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-500"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-6 max-w-xs animate-fade-in animation-delay-800 hover:scale-105 transition-transform duration-300">
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
