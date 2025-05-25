
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-roboto">
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl w-80 h-96 mb-4 border border-peach-medium/30 animate-slide-in-right">
          <div className="bg-gradient-to-r from-peach-medium to-peach-dark text-gray-800 p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Tư vấn trực tuyến</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            <div className="bg-peach-light/50 p-3 rounded-lg mb-3">
              <p className="text-sm">Chào bạn! Chúng tôi có thể hỗ trợ gì cho bạn?</p>
            </div>
            <div className="bg-accent-medium/50 p-3 rounded-lg mb-3 ml-8">
              <p className="text-sm">Tôi muốn tìm hiểu về khóa học MC</p>
            </div>
            <div className="bg-peach-light/50 p-3 rounded-lg mb-3">
              <p className="text-sm">Bạn có thể để lại thông tin liên hệ, chúng tôi sẽ tư vấn chi tiết cho bạn.</p>
            </div>
          </div>
          <div className="p-4 border-t border-peach-medium/30">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-peach-medium/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-peach-dark"
              />
              <Button size="sm" className="bg-gradient-to-r from-peach-medium to-peach-dark hover:from-peach-dark hover:to-accent-medium text-gray-800">
                Gửi
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-peach-medium to-peach-dark hover:from-peach-dark hover:to-accent-medium text-gray-800 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </Button>
    </div>
  );
};

export default ChatBox;
