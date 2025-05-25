
import React from 'react';

const CommitmentsSection = () => {
  const commitments = [
    {
      icon: (
        <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Học linh hoạt",
      description: "Thời gian học linh hoạt, phù hợp với lịch trình công việc của bạn. Có thể học online hoặc offline theo nhu cầu."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Địa điểm phù hợp",
      description: "Cơ sở vật chất hiện đại, trang thiết bị âm thanh ánh sáng chuyên nghiệp, tạo môi trường học tập tốt nhất."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Cam kết chất lượng",
      description: "Đảm bảo chất lượng đào tạo với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiệu quả."
    }
  ];

  return (
    <section className="py-20 bg-white font-roboto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Cam kết của Spika</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ba điểm mạnh làm nên sự khác biệt của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((commitment, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors">
                {commitment.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{commitment.title}</h3>
              <p className="text-gray-600 leading-relaxed">{commitment.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommitmentsSection;
