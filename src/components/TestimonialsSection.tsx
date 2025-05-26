
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const TestimonialsSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "MC Freelancer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Spika đã giúp tôi từ một người nhút nhát trở thành MC tự tin. Giảng viên rất tận tâm và phương pháp học rất hiệu quả."
    },
    {
      name: "Trần Văn Hùng",
      role: "MC Sự kiện",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Khóa học MC chuyên nghiệp tại đây thực sự chất lượng. Sau khi tốt nghiệp, tôi đã có thu nhập ổn định từ nghề MC."
    },
    {
      name: "Phạm Thị Lan",
      role: "MC Truyền hình",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Môi trường học tập chuyên nghiệp, cơ sở vật chất hiện đại. Cảm ơn Spika đã giúp tôi theo đuổi đam mê MC."
    }
  ];

  return (
    <section className="py-20 bg-gray-50 font-roboto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-16 transition-all duration-1000 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className={`text-4xl font-bold text-gray-900 mb-4 transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{transitionDelay: sectionVisible ? '200ms' : '0ms'}}>
            Học viên nói gì về Spika
          </h2>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{transitionDelay: sectionVisible ? '400ms' : '0ms'}}>
            Những chia sẻ chân thực từ các học viên đã thành công
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className={`hover:shadow-2xl transition-all duration-700 hover:scale-105 group ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: sectionVisible ? `${600 + index * 200}ms` : '0ms'}}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className={`w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300 ${sectionVisible ? 'animate-pulse' : ''}`} style={{transitionDelay: `${i * 50}ms`, animationDelay: sectionVisible ? `${800 + index * 200 + i * 100}ms` : '0ms', animationDuration: '0.5s', animationIterationCount: '1'}} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic group-hover:text-gray-800 transition-colors duration-300">"{testimonial.comment}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
