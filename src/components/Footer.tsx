import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 font-roboto" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-24 h-24">
                <img 
                  src="/images/logo2.png" 
                  alt="Future Wings Academy Logo" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Future Wings Academy - Nơi ươm mầm và phát triển tài năng, định hướng tương lai cho thế hệ trẻ.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/futurewings.academy.vn" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-white transition-colors">Trang chủ</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">Giới thiệu</a></li>
              <li><a href="#courses" className="text-gray-400 hover:text-white transition-colors">Khóa học</a></li>
              <li><a href="#blog" className="text-gray-400 hover:text-white transition-colors">Blog chia sẻ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-300">Địa chỉ</h4>
                <p className="text-gray-400">SN 20, Ngõ 16, Trần Nhật Duật, Lê Hồng Phong, Phủ Lý, Hà Nam</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300">Điện thoại / Zalo</h4>
                <p className="text-gray-400">0853326829</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300">Email</h4>
                <p className="text-gray-400">futurewings.academy@gmail.com</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-300">Thời gian làm việc</h4>
                <p className="text-gray-400">Thứ 2 - Chủ nhật: 8:00 - 21:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Future Wings Academy. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
