
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { BookOpen, Calendar, Clock } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Kỹ năng lập trình cần thiết cho sinh viên năm 2024',
    excerpt: 'Khám phá những kỹ năng lập trình quan trọng nhất mà sinh viên cần nắm vững để thành công trong thời đại công nghệ 4.0.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
    publishedAt: '15 Tháng 12, 2024',
    readTime: '5 phút đọc'
  },
  {
    id: '2',
    title: 'Hướng dẫn học React từ cơ bản đến nâng cao',
    excerpt: 'Lộ trình học React chi tiết từ những khái niệm cơ bản đến các kỹ thuật nâng cao, giúp bạn trở thành một React developer chuyên nghiệp.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    publishedAt: '12 Tháng 12, 2024',
    readTime: '8 phút đọc'
  },
  {
    id: '3',
    title: 'Xu hướng công nghệ 2024: AI và Machine Learning',
    excerpt: 'Tìm hiểu về những xu hướng công nghệ mới nhất trong lĩnh vực AI và Machine Learning, cũng như cơ hội nghề nghiệp trong tương lai.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    publishedAt: '10 Tháng 12, 2024',
    readTime: '6 phút đọc'
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
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-roboto relative overflow-hidden" id="blog">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={titleRef} className="text-center mb-16 reveal reveal-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Blog chia sẻ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá những bài viết hữu ích về công nghệ, lập trình và xu hướng học tập mới nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <div 
              key={post.id}
              ref={cardRefs[index]}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 reveal reveal-scale bg-white/80 backdrop-blur-sm border border-white/20"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 z-10"></div>
              
              {/* Image container */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500"></div>
                
                {/* Icon overlay */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {post.publishedAt}
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <Button 
                  onClick={() => handleReadMore(post.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Đọc thêm
                </Button>

                {/* Bottom accent line */}
                <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={() => navigate('/blog')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 px-8 py-3 text-lg font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Xem tất cả bài viết
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
