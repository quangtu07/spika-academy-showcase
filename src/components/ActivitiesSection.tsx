import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Camera, Award, Users, ArrowRight } from 'lucide-react';

const ActivitiesSection = () => {
  const titleRef = useScrollReveal({ threshold: 0.2 });
  const activityRefs = [
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' })
  ];

  const activities = [
    {
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Workshop MC Chuyên Nghiệp",
      description: "Học hỏi kỹ năng dẫn chương trình từ các chuyên gia hàng đầu",
      icon: Award,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Cuộc Thi MC Tài Năng",
      description: "Sân chơi để học viên thể hiện tài năng và kỹ năng",
      icon: Users,
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Thực Hành Tại Sự Kiện",
      description: "Cơ hội thực hành tại các sự kiện thực tế",
      icon: Camera,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-roboto relative overflow-hidden" id="activities">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Hoạt động nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Những khoảnh khắc đáng nhớ trong hành trình học tập và phát triển tại Spika
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div 
                key={index} 
                ref={activityRefs[index]}
                className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 reveal reveal-scale bg-white/80 backdrop-blur-sm border border-white/20"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activity.gradient} z-10`}></div>
                
                {/* Image container */}
                <div className="relative overflow-hidden">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500"></div>
                  
                  {/* Icon overlay */}
                  <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-r ${activity.gradient} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {activity.description}
                  </p>
                  

                  {/* Bottom accent line */}
                  <div className={`w-full h-1 bg-gradient-to-r ${activity.gradient} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
