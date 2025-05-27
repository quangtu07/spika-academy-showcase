
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
    instructor_id: ''
  });
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        instructor_id: course.instructor_id
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        image_url: '',
        instructor_id: ''
      });
    }
  }, [course]);

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

    try {
      const courseData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        image_url: formData.image_url || null,
        instructor_id: formData.instructor_id
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
            <Label htmlFor="name">Tên khóa học</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="instructor_id">Giáo viên</Label>
            <Select value={formData.instructor_id} onValueChange={(value) => setFormData({...formData, instructor_id: value})}>
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
              <Label htmlFor="duration">Thời lượng (buổi)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                min="1"
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
