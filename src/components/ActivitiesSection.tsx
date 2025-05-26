
import React from 'react';

const ActivitiesSection = () => {
  const activities = [
    {
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Buổi thực hành MC sự kiện"
    },
    {
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Lớp học kỹ năng giao tiếp"
    },
    {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Workshop với MC nổi tiếng"
    },
    {
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Gala kỷ niệm thành lập"
    },
    {
      image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Hoạt động ngoại khóa"
    },
    {
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      title: "Du lịch học tập"
    }
  ];

  return (
    <section className="py-20 bg-white font-roboto" id="activities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hoạt động nổi bật</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những khoảnh khắc đáng nhớ trong hành trình học tập tại Spika
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in hover:scale-105" style={{animationDelay: `${100 + index * 100}ms`}}>
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-500"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-bold text-lg group-hover:text-xl transition-all duration-300">{activity.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
