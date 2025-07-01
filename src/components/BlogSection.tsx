
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Phát triển kỹ năng mềm cho trẻ: Tầm quan trọng và cách thức phát triển',
    excerpt: 'Cha mẹ nên rèn kỹ năng mềm cho trẻ từ sớm để giúp trẻ phát triển toàn diện và thành công trong cuộc sống.',
    image: '/images/blog/1.png',
    publishedAt: '15 Tháng 12, 2024'
  },
  {
    id: '2',
    title: 'Muốn chữa ngọng cho trẻ, phải làm sao?',
    excerpt: 'Trẻ nói ngọng cần được phát hiện và can thiệp sớm để tránh ảnh hưởng giao tiếp, học tập. Bài viết hướng dẫn cha mẹ cách chữa ngọng hiệu quả cho trẻ.',
    image: '/images/blog/2.png',
    publishedAt: '12 Tháng 12, 2024'
  },
  {
    id: '3',
    title: '5 yếu tố quan trọng trong việc luyện giọng nói cho trẻ',
    excerpt: 'Giọng nói giúp tạo ấn tượng và nên được rèn luyện từ nhỏ, dù ở bất kỳ nghề nào hay độ tuổi nào.',
    image: '/images/blog/3.jpg',
    publishedAt: '10 Tháng 12, 2024'
  }
];

const BlogSection = () => {
  const navigate = useNavigate();
  const titleRef = useScrollReveal({ threshold: 0.2 });
  const cardRefs = [
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' }),
    useScrollReveal({ threshold: 0.2, rootMargin: '50px' })
  ];

  const handleReadMore = (blogId: string) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto relative overflow-hidden" id="blog">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-20 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#02458b] rounded-2xl mb-6 shadow-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Blog chia sẻ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Khám phá cùng những kiến thức và phương pháp giúp con bạn bứt phá tiềm năng, vững bước tương lai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div 
              key={post.id}
              ref={cardRefs[index]}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 reveal reveal-scale border border-gray-100"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Image container */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500"></div>
                
                {/* Icon overlay */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-[#02458b] rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-4 group-hover:text-[#02458b] transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <Button 
                  onClick={() => handleReadMore(post.id)}
                  className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Đọc thêm
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={() => navigate('/blog')}
            className="bg-[#02458b] hover:bg-[#02458b]/90 text-white border-0 px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Xem tất cả bài viết
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
