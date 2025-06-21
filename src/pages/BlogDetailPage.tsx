import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogContent {
  id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
  readTime: string;
  author: string;
  tags: string[];
}

const blogContents: Record<string, BlogContent> = {
  '1': {
    id: '1',
    title: 'Kỹ năng lập trình cần thiết cho sinh viên năm 2024',
    content: `
      <p>Trong thời đại công nghệ 4.0, việc nắm vững các kỹ năng lập trình không chỉ là lợi thế mà đã trở thành yêu cầu bắt buộc đối với sinh viên ngành công nghệ thông tin.</p>
      
      <img src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=400&fit=crop" alt="Programming skills" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>1. Ngôn ngữ lập trình cơ bản</h3>
      <p>JavaScript vẫn là ngôn ngữ được sử dụng rộng rãi nhất, đặc biệt trong phát triển web. Python cũng rất quan trọng cho AI và data science.</p>
      
      <h3>2. Framework và thư viện</h3>
      <p>React, Vue.js cho frontend và Node.js, Django cho backend là những công nghệ quan trọng cần nắm vững.</p>
      
      <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop" alt="Code matrix" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>3. Kỹ năng soft skills</h3>
      <p>Ngoài kỹ năng kỹ thuật, khả năng làm việc nhóm, giao tiếp và tư duy logic cũng rất quan trọng trong môi trường làm việc thực tế.</p>
      
      <p>Để thành công trong lĩnh vực lập trình, sinh viên cần không ngừng học hỏi và cập nhật kiến thức mới. Hãy tham gia các dự án thực tế và xây dựng portfolio để có được kinh nghiệm quý báu.</p>
    `,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    publishedAt: '15 Tháng 12, 2024',
    readTime: '5 phút đọc',
    author: 'Nguyễn Văn A',
    tags: ['Lập trình', 'Sinh viên', 'Kỹ năng', 'Công nghệ']
  },
  '2': {
    id: '2',
    title: 'Hướng dẫn học React từ cơ bản đến nâng cao',
    content: `
      <p>React là một trong những thư viện JavaScript phổ biến nhất hiện nay. Bài viết này sẽ hướng dẫn bạn từng bước để trở thành một React developer chuyên nghiệp.</p>
      
      <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop" alt="React development" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>Bước 1: Nắm vững JavaScript cơ bản</h3>
      <p>Trước khi học React, bạn cần có kiến thức vững chắc về JavaScript ES6+, bao gồm arrow functions, destructuring, và promises.</p>
      
      <h3>Bước 2: Hiểu về JSX và Components</h3>
      <p>JSX là cú pháp mở rộng của JavaScript cho phép viết HTML trong JavaScript. Components là building blocks của ứng dụng React.</p>
      
      <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop" alt="Woman coding" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>Bước 3: State Management và Hooks</h3>
      <p>Học cách sử dụng useState, useEffect và các hooks khác để quản lý state và side effects trong ứng dụng.</p>
      
      <h3>Bước 4: Routing và Navigation</h3>
      <p>React Router giúp tạo Single Page Applications với nhiều trang và navigation.</p>
      
      <p>Hãy thực hành thường xuyên bằng cách xây dựng các dự án nhỏ và từ từ nâng cao độ phức tạp. Đừng quên tham gia cộng đồng React để học hỏi từ những developer khác.</p>
    `,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    publishedAt: '12 Tháng 12, 2024',
    readTime: '8 phút đọc',
    author: 'Trần Thị B',
    tags: ['React', 'JavaScript', 'Frontend', 'Hướng dẫn']
  },
  '3': {
    id: '3',
    title: 'Xu hướng công nghệ 2024: AI và Machine Learning',
    content: `
      <p>Năm 2024 đánh dấu bước ngoặt quan trọng trong việc ứng dụng AI và Machine Learning vào thực tế. Hãy cùng khám phá những xu hướng nổi bật nhất.</p>
      
      <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop" alt="AI Circuit board" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>1. Generative AI và ChatGPT</h3>
      <p>Công nghệ AI tạo sinh đã thay đổi cách chúng ta làm việc, từ viết code đến tạo nội dung sáng tạo.</p>
      
      <h3>2. Machine Learning tự động (AutoML)</h3>
      <p>AutoML giúp các developer không chuyên về ML cũng có thể xây dựng và triển khai các mô hình AI hiệu quả.</p>
      
      <img src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=400&fit=crop" alt="AI screens" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;" />
      
      <h3>3. Edge AI và IoT</h3>
      <p>Việc đưa AI xuống các thiết bị edge mở ra nhiều ứng dụng thực tế trong smart home, autonomous vehicles.</p>
      
      <h3>4. Cơ hội nghề nghiệp</h3>
      <p>Nhu cầu về AI Engineer, ML Engineer, và Data Scientist đang tăng mạnh. Đây là thời điểm tốt để đầu tư học các kỹ năng này.</p>
      
      <p>Tương lai thuộc về những người biết cách kết hợp AI với domain knowledge cụ thể. Hãy bắt đầu học AI ngay hôm nay để không bị bỏ lại phía sau.</p>
    `,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    publishedAt: '10 Tháng 12, 2024',
    readTime: '6 phút đọc',
    author: 'Lê Văn C',
    tags: ['AI', 'Machine Learning', 'Xu hướng', 'Công nghệ']
  }
};

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const blog = id ? blogContents[id] : null;

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            Quay về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link bài viết!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang chủ
          </Button>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            
            <div className="p-8">
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4 gap-4">
                <div>Tác giả: {blog.author}</div>
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {blog.title}
              </h1>
              
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
                style={{
                  lineHeight: '1.8',
                }}
              />
            </div>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
