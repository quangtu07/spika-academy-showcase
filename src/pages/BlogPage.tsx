
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
  readTime: string;
  author: string;
  tags: string[];
}

const allBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Kỹ năng lập trình cần thiết cho sinh viên năm 2024',
    excerpt: 'Khám phá những kỹ năng lập trình quan trọng nhất mà sinh viên cần nắm vững để thành công trong thời đại công nghệ 4.0.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
    publishedAt: '15 Tháng 12, 2024',
    readTime: '5 phút đọc',
    author: 'Nguyễn Văn A',
    tags: ['Lập trình', 'Sinh viên', 'Kỹ năng']
  },
  {
    id: '2',
    title: 'Hướng dẫn học React từ cơ bản đến nâng cao',
    excerpt: 'Lộ trình học React chi tiết từ những khái niệm cơ bản đến các kỹ thuật nâng cao, giúp bạn trở thành một React developer chuyên nghiệp.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    publishedAt: '12 Tháng 12, 2024',
    readTime: '8 phút đọc',
    author: 'Trần Thị B',
    tags: ['React', 'JavaScript', 'Frontend']
  },
  {
    id: '3',
    title: 'Xu hướng công nghệ 2024: AI và Machine Learning',
    excerpt: 'Tìm hiểu về những xu hướng công nghệ mới nhất trong lĩnh vực AI và Machine Learning, cũng như cơ hội nghề nghiệp trong tương lai.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    publishedAt: '10 Tháng 12, 2024',
    readTime: '6 phút đọc',
    author: 'Lê Văn C',
    tags: ['AI', 'Machine Learning', 'Xu hướng']
  }
];

const BlogPage = () => {
  const navigate = useNavigate();

  const handleReadMore = (blogId: string) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang chủ
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tất cả bài viết
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá những bài viết hữu ích về công nghệ, lập trình và xu hướng học tập mới nhất
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allBlogPosts.map((post) => (
            <Card 
              key={post.id} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {post.title}
                </CardTitle>
                <p className="text-sm text-gray-600">Tác giả: {post.author}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 line-clamp-3 mb-6">
                  {post.excerpt}
                </p>
                
                <Button 
                  onClick={() => handleReadMore(post.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Đọc thêm
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPage;
