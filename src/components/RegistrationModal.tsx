import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  name: string;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    childName: '',
    email: '',
    phone: '',
    course: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .eq('status', 'Đang mở')
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Hiển thị thông báo cảm ơn ngay lập tức
    toast({
      title: "Cảm ơn bạn đã đăng ký tư vấn!",
      description: "Chúng mình sẽ liên hệ với bạn sớm nhất.",
    });
    
    setFormData({ fullName: '', childName: '', email: '', phone: '', course: '' });
    onClose();

    try {
      // Tìm tên khóa học từ ID được chọn
      const selectedCourse = courses.find(course => course.id === formData.course);
      const courseName = selectedCourse ? selectedCourse.name : 'Chưa xác định';

      console.log('Sending consultation request:', {
        fullName: formData.fullName,
        childName: formData.childName,
        email: formData.email,
        phone: formData.phone,
        courseName
      });

      // Gửi email trong background (không đợi kết quả)
      supabase.functions.invoke('send-consultation-email', {
        body: {
          fullName: formData.fullName,
          childName: formData.childName,
          email: formData.email,
          phone: formData.phone,
          courseName: courseName
        }
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent successfully:', data);
        }
      });

    } catch (error) {
      console.error('Error submitting consultation request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] font-roboto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Đăng ký tư vấn miễn phí
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Để lại thông tin để nhận tư vấn chi tiết về khóa học phù hợp
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Họ và tên phụ huynh *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Nhập họ và tên phụ huynh"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="childName" className="text-sm font-medium text-gray-700">
              Họ và tên bé *
            </Label>
            <Input
              id="childName"
              type="text"
              value={formData.childName}
              onChange={(e) => handleInputChange('childName', e.target.value)}
              placeholder="Nhập họ và tên bé"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Nhập email liên hệ"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Số điện thoại *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="course" className="text-sm font-medium text-gray-700">
              Khóa học quan tâm *
            </Label>
            <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn khóa học bạn quan tâm" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi thông tin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;
