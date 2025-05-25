
import React from 'react';
import { Button } from '@/components/ui/button';

const AboutSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-accent-light to-peach-light font-roboto" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Về trung tâm <span className="bg-gradient-to-r from-peach-dark to-accent-medium bg-clip-text text-transparent">Spika</span>
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
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center bg-white/50 rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold bg-gradient-to-r from-peach-dark to-accent-medium bg-clip-text text-transparent mb-2">10+</div>
                <div className="text-gray-600">Năm kinh nghiệm</div>
              </div>
              <div className="text-center bg-white/50 rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold bg-gradient-to-r from-peach-dark to-accent-medium bg-clip-text text-transparent mb-2">1000+</div>
                <div className="text-gray-600">Học viên đã tốt nghiệp</div>
              </div>
              <div className="text-center bg-white/50 rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold bg-gradient-to-r from-peach-dark to-accent-medium bg-clip-text text-transparent mb-2">50+</div>
                <div className="text-gray-600">Giảng viên chuyên nghiệp</div>
              </div>
              <div className="text-center bg-white/50 rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold bg-gradient-to-r from-peach-dark to-accent-medium bg-clip-text text-transparent mb-2">95%</div>
                <div className="text-gray-600">Học viên hài lòng</div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-peach-medium to-peach-dark hover:from-peach-dark hover:to-accent-medium text-gray-800 px-8 py-3 shadow-lg">
              Tìm hiểu thêm
            </Button>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Lớp học tại Spika"
              className="rounded-lg shadow-xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 max-w-xs border border-peach-medium/20">
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
