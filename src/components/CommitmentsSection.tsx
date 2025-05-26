import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Sparkles, Shield, Clock } from 'lucide-react';

const CommitmentsSection = () => {
  const titleRef = useScrollReveal({ threshold: 0.2 });
  const commitmentRefs = [
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' })
  ];

  const commitments = [
    {
      icon: <Sparkles className="w-12 h-12 text-primary-600" />,
      title: "Chất lượng đào tạo",
      description: "Cam kết đào tạo chất lượng với giáo trình chuẩn quốc tế và đội ngũ giảng viên giàu kinh nghiệm"
    },
    {
      icon: <Shield className="w-12 h-12 text-primary-600" />,
      title: "Bảo đảm việc làm",
      description: "Hỗ trợ tư vấn và giới thiệu việc làm cho học viên sau khi hoàn thành khóa học"
    },
    {
      icon: <Clock className="w-12 h-12 text-primary-600" />,
      title: "Thời gian linh hoạt",
      description: "Lịch học linh hoạt, phù hợp với nhiều đối tượng học viên khác nhau"
    }
  ];

  return (
    <section className="py-20 bg-white font-roboto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Cam kết của Spika</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ba điểm mạnh làm nên sự khác biệt của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((commitment, index) => (
            <div 
              key={index} 
              ref={commitmentRefs[index]}
              className="text-center group hover:scale-105 transition-transform duration-300 reveal reveal-fade-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
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
