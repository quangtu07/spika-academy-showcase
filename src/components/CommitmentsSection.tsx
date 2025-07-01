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
      title: "Chất Lượng Giáo Dục Vượt Trội",
      description: "Giáo trình tiên tiến, phương pháp độc quyền, cam kết con bạn phát triển nền tảng kỹ năng vững chắc",
      gradient: "from-[#02458b] to-[#02458b]",
      bgGradient: "from-[#02458b]/10 to-[#02458b]/10"
    },
    {
      icon: Shield,
      title: "Môi Trường Học Tập Truyền Cảm Hứng",
      description: "Không gian an toàn, thân thiện, nơi con tự tin khám phá, thể hiện bản thân và phát triển tự nhiên",
      gradient: "from-[#02458b] to-[#02458b]",
      bgGradient: "from-[#02458b]/10 to-[#02458b]/10"
    },
    {
      icon: Clock,
      title: "Đội Ngũ Giáo Viên Tận Tâm & Chuyên Môn",
      description: "Đội ngũ thầy cô giàu kinh nghiệm, am hiểu tâm lý trẻ, luôn đồng hành khơi gợi tối đa tiềm năng",
      gradient: "from-[#02458b] to-[#02458b]",
      bgGradient: "from-[#02458b]/10 to-[#02458b]/10"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#02458b] rounded-2xl mb-6 shadow-xl">
            <Star className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-[#02458b] mb-6">
            Cam kết của FutureWings
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ba Cam Kết Vàng Nâng Tầm Tương Lai Vững Chắc
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
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#02458b] transition-colors duration-300">
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
