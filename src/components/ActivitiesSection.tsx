import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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
      title: "Workshop MC Chuyên Nghiệp"
    },
    {
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Cuộc Thi MC Tài Năng"
    },
    {
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Thực Hành Tại Sự Kiện"
    }
  ];

  return (
    <section className="py-20 bg-white font-roboto" id="activities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hoạt động nổi bật</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những khoảnh khắc đáng nhớ trong hành trình học tập tại Spika
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <div 
              key={index} 
              ref={activityRefs[index]}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 reveal reveal-scale"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-bold text-lg">{activity.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
