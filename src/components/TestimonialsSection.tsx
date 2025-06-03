
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Quote, MessageCircle, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "MC Freelancer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Spika đã giúp tôi từ một người nhút nhát trở thành MC tự tin. Giảng viên rất tận tâm và phương pháp học rất hiệu quả.",
      gradient: "from-orange-400 to-red-400"
    },
    {
      name: "Trần Văn Hùng",
      role: "MC Sự kiện",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Khóa học MC chuyên nghiệp tại đây thực sự chất lượng. Sau khi tốt nghiệp, tôi đã có thu nhập ổn định từ nghề MC.",
      gradient: "from-pink-400 to-rose-400"
    },
    {
      name: "Phạm Thị Lan",
      role: "MC Truyền hình",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      comment: "Môi trường học tập chuyên nghiệp, cơ sở vật chất hiện đại. Cảm ơn Spika đã giúp tôi theo đuổi đam mê MC.",
      gradient: "from-amber-400 to-orange-400"
    }
  ];

  const titleRef = useScrollReveal({ threshold: 0.2 });
  const cardRefs = testimonials.map(() => useScrollReveal({ threshold: 0.2 }));

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 font-roboto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-300/20 to-rose-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-300/10 to-orange-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6 shadow-xl">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            Học viên nói gì về Spika
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Những chia sẻ chân thực từ các học viên đã thành công trong hành trình học tập
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              ref={cardRefs[index]} 
              className="reveal reveal-fade-up"
              style={{ animationDelay: `${(index + 1) * 200}ms` }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl relative overflow-hidden h-full">
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${testimonial.gradient}`}></div>
                
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Quote icon */}
                  <div className="flex justify-end mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                      <Quote className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Rating stars */}
                  <div className="flex mb-6 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center mr-1 shadow-sm`}>
                        <Star className="w-4 h-4 text-white fill-current" />
                      </div>
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 italic text-center leading-relaxed mb-6 text-lg flex-grow">
                    "{testimonial.comment}"
                  </p>

                  {/* Profile */}
                  <div className="flex items-center justify-center mt-auto">
                    <div className="relative">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover shadow-lg ring-4 ring-white"
                      />
                      <div className={`absolute -inset-1 bg-gradient-to-r ${testimonial.gradient} rounded-full opacity-30 blur-sm`}></div>
                    </div>
                    <div className="ml-4 text-center">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className={`w-full h-1 bg-gradient-to-r ${testimonial.gradient} rounded-full mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
