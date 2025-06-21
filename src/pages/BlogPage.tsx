
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
}

const allBlogPosts: BlogPost[] = [
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
