
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CoursesSection = () => {
  const courses = [
    {
      id: 1,
      title: "MC Cơ bản",
      description: "Khóa học dành cho người mới bắt đầu, học các kỹ năng dẫn chương trình cơ bản",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      duration: "3 tháng",
      level: "Cơ bản"
    },
    {
      id: 2,
      title: "MC Sự kiện",
      description: "Chuyên về dẫn chương trình sự kiện, hội nghị, lễ hội và các hoạt động lớn",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      duration: "4 tháng",
      level: "Trung cấp"
    },
    {
      id: 3,
      title: "MC Chuyên nghiệp",
      description: "Khóa học nâng cao cho những ai muốn trở thành MC chuyên nghiệp, có thu nhập cao",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      duration: "6 tháng",
      level: "Nâng cao"
    }
  ];

  return (
    <section className="py-20 bg-white font-roboto" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Khóa học nổi bật</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn khóa học phù hợp với trình độ và mục tiêu của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group border-peach-medium/20">
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-peach-medium to-peach-dark text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                  {course.level}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">{course.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Thời gian: {course.duration}</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-peach-medium to-peach-dark hover:from-peach-dark hover:to-accent-medium text-gray-800 shadow-md">
                  Xem thêm
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
