
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
    phone: '',
    course: '',
    googleSheetUrl: '' // URL Google Apps Script
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

  const sendToGoogleSheet = async (fullName: string, phone: string, courseName: string) => {
    try {
      // Thay thế URL này bằng URL Google Apps Script của bạn
      const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
      
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          phone,
          courseName,
          timestamp: new Date().toISOString()
        })
      });

      console.log('Data sent to Google Sheet successfully');
    } catch (error) {
      console.error('Error sending to Google Sheet:', error);
      // Không hiển thị lỗi cho user vì đây là tính năng phụ
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
    
    const originalFormData = { ...formData };
    setFormData({ fullName: '', phone: '', course: '', googleSheetUrl: '' });
    onClose();

    try {
      // Tìm tên khóa học từ ID được chọn
      const selectedCourse = courses.find(course => course.id === originalFormData.course);
      const courseName = selectedCourse ? selectedCourse.name : 'Chưa xác định';

      console.log('Sending consultation request:', {
        fullName: originalFormData.fullName,
        phone: originalFormData.phone,
        courseName
      });

      // Gửi email trong background (không đợi kết quả)
      supabase.functions.invoke('send-consultation-email', {
        body: {
          fullName: originalFormData.fullName,
          phone: originalFormData.phone,
          courseName: courseName
        }
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent successfully:', data);
        }
      });

      // Gửi thông tin đến Google Sheet
      await sendToGoogleSheet(originalFormData.fullName, originalFormData.phone, courseName);

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
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Đăng ký tư vấn miễn phí
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Để lại thông tin để nhận tư vấn chi tiết về khóa học phù hợp
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Họ và tên *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              required
              className="mt-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              className="mt-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <Label htmlFor="course" className="text-sm font-medium text-gray-700">
              Khóa học quan tâm *
            </Label>
            <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
              <SelectTrigger className="mt-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
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
              className="flex-1 hover:bg-gray-50"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
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
