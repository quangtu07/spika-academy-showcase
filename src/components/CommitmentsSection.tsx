import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Sparkles, Shield, Clock, Star } from 'lucide-react';

const CommitmentsSection = () => {
  const titleRef = useScrollReveal({ threshold: 0.2 });
  const commitmentRefs = [
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' })
  ];

  const commitments = [
    {
      icon: Sparkles,
      title: "Chất lượng đào tạo",
      description: "Cam kết đào tạo chất lượng với giáo trình chuẩn quốc tế và đội ngũ giảng viên giàu kinh nghiệm",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: Shield,
      title: "Bảo đảm việc làm",
      description: "Hỗ trợ tư vấn và giới thiệu việc làm cho học viên sau khi hoàn thành khóa học",
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: Clock,
      title: "Thời gian linh hoạt",
      description: "Lịch học linh hoạt, phù hợp với nhiều đối tượng học viên khác nhau",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-roboto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <Star className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Cam kết của Spika
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ba điểm mạnh làm nên sự khác biệt của chúng tôi trong lĩnh vực đào tạo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((commitment, index) => {
            const IconComponent = commitment.icon;
            return (
              <div 
                key={index} 
                ref={commitmentRefs[index]}
                className="text-center group hover:transform hover:-translate-y-2 transition-all duration-500 reveal reveal-fade-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 h-full">
                  {/* Icon with gradient background */}
                  <div className={`w-20 h-20 bg-gradient-to-r ${commitment.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                      {commitment.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {commitment.description}
                    </p>
                  </div>

                  {/* Bottom accent bar */}
                  <div className={`w-full h-1 bg-gradient-to-r ${commitment.gradient} rounded-full mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommitmentsSection;
