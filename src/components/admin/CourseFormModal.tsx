
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image_url?: string;
  instructor_id: string;
  status?: string;
}

interface Instructor {
  id: string;
  fullname: string;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSaved: () => void;
}

const CourseFormModal = ({ isOpen, onClose, course, onSaved }: CourseFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image_url: '',
    instructor_id: '',
    status: ''
  });
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      image_url: '',
      instructor_id: '',
      status: ''
    });
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description || '',
        price: course.price ? course.price.toString() : '',
        duration: course.duration ? course.duration.toString() : '',
        image_url: course.image_url || '',
        instructor_id: course.instructor_id,
        status: course.status || ''
      });
    } else {
      resetForm();
    }
  }, [course, isOpen]);

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname')
        .in('role', ['teacher', 'admin']);

      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên khóa học là bắt buộc",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Lỗi",
        description: "Mô tả là bắt buộc",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.instructor_id) {
      toast({
        title: "Lỗi",
        description: "Giáo viên là bắt buộc",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.duration) {
      toast({
        title: "Lỗi",
        description: "Thời lượng là bắt buộc",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.status) {
      toast({
        title: "Lỗi",
        description: "Trạng thái là bắt buộc",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const courseData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        image_url: formData.image_url || null,
        instructor_id: formData.instructor_id,
        status: formData.status
      };

      if (course) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Đã cập nhật khóa học",
          className: "bg-green-50 border-green-200 text-green-900",
        });
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Đã tạo khóa học mới thành công",
          className: "bg-green-50 border-green-200 text-green-900",
        });
        
        // Reset form after successful creation
        resetForm();
      }

      onSaved();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Lỗi",
        description: course ? "Không thể cập nhật khóa học" : "Không thể tạo khóa học mới",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Tên khóa học <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="instructor_id">Giáo viên <span className="text-red-500">*</span></Label>
            <Select value={formData.instructor_id} onValueChange={(value) => setFormData({...formData, instructor_id: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn giáo viên" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.fullname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Trạng thái <span className="text-red-500">*</span></Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Đang mở">Đang mở</SelectItem>
                <SelectItem value="Đang bắt đầu">Đang bắt đầu</SelectItem>
                <SelectItem value="Kết thúc">Kết thúc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Giá (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                min="0"
                step="1000"
              />
            </div>
            <div>
              <Label htmlFor="duration">Thời lượng (buổi) <span className="text-red-500">*</span></Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">URL hình ảnh</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : course ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormModal;
