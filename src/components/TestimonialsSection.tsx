import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Quote, MessageCircle, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Chị Nguyễn Thị Thu",
      role: "Mẹ bé Bảo Nam, 9 tuổi",
      avatar: "/images/ava01.jpg",
      rating: 5,
      comment: "Trung tâm đã vượt xa kỳ vọng của tôi! Bé Nam nhà tôi trước đây rất ít nói  hay ngại ngùng, nhưng chỉ sau vài tháng học, con đã tự tin phát biểu ý kiến ở lớp, còn mạnh dạn xung phong làm nhóm trưởng. ",
      gradient: "from-[#02458b] to-[#02458b]"
    },
    {
      name: "Mẹ bé Hải Đăng",
      role: "Mẹ bé Hải Đăng, 7 tuổi",
      avatar: "/images/ava02.jpg",
      rating: 5,
      comment: "Từ khi học ở Future Wings Academy, tôi không còn phải lo lắng về việc con quên bài. Thầy cô giao bài tập và tài liệu luyện tập ngay trên web! Bé nhà tôi có thể làm bài bất cứ lúc nào, ở đâu. Điều này giúp con chủ động hơn và tôi cũng dễ dàng theo dõi tiến độ của con.",
      gradient: "from-[#02458b] to-[#02458b]"
    },
    {
      name: "Chị Nguyễn Hồng Thu",
      role: "Mẹ bé Linh Chi, 13 tuổi",
      avatar: "/images/ava3.jpg",
      rating: 5,
      comment: "Lộ trình học tại Future Wings Academy rất khoa học, dễ tiếp thu. Thầy cô giảng dạy cực kỳ lôi cuốn, biến việc học thành niềm vui. Nhờ đó, kỹ năng thuyết trình của Linh Chi tiến bộ vượt bậc, con luôn hào hứng đến lớp",
      gradient: "from-[#02458b] to-[#02458b]"
    }
  ];

  const titleRef = useScrollReveal({ threshold: 0.2 });
  const cardRefs = testimonials.map(() => useScrollReveal({ threshold: 0.2 }));

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#02458b] rounded-2xl mb-6 shadow-xl">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-[#02458b] mb-6 leading-tight">
            Học Viên & Phụ Huynh Nói Gì Về Future Wings?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Khám phá hành trình phát triển đầy hứng khởi của con bạn cùng FutureWings qua những chia sẻ chân thực nhất!
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
                      <div className={`absolute -inset-1 ${testimonial.gradient} rounded-full opacity-30 blur-sm`}></div>
                    </div>
                    <div className="ml-4 text-center">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#02458b] transition-colors duration-300">
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
