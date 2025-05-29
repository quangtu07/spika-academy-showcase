import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Image, Upload, X } from 'lucide-react';
import { uploadCourseImage, deleteCourseImage } from '@/lib/storage-helpers';

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image_url?: string;
  status?: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSaved: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CourseFormModal = ({ isOpen, onClose, course, onSaved }: CourseFormModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image_url: '',
    status: '' as Course['status'] | ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      image_url: '',
      status: '' as Course['status'] | ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description || '',
        price: course.price ? course.price.toString() : '',
        duration: course.duration ? course.duration.toString() : '',
        image_url: course.image_url || '',
        status: course.status || '' as Course['status'] | ''
      });
      setImagePreview(course.image_url || '');
    } else {
      resetForm();
    }
  }, [course, isOpen]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra loại file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WebP",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const courseData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        status: formData.status || 'Đang mở', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (course) {
        // Nếu đang edit và có ảnh mới, xóa ảnh cũ và upload ảnh mới
        if (imageFile) {
          if (course.image_url) {
            await deleteCourseImage(course.image_url);
          }
          const imageUrl = await uploadCourseImage(imageFile, course.id);
          courseData.image_url = imageUrl;
        }
        courseData.updated_at = new Date().toISOString();

        // Update course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id);
        if (error) throw error;
      } else {
        // Thêm mới khóa học (không có ảnh)
        const { error: insertError } = await supabase
          .from('courses')
          .insert([courseData]);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      }

      toast({
        title: "Thành công",
        description: `Đã ${course ? 'cập nhật' : 'thêm'} khóa học thành công`,
        className: "bg-green-50 border-green-200 text-green-900",
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu khóa học",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{course ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên khóa học</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Số buổi học</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          {course && (
            <div className="space-y-2">
              <Label>Ảnh khóa học</Label>
              <div className="mt-2 space-y-2">
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={imagePreview}
                      alt="Course preview"
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                        setFormData({ ...formData, image_url: '' });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Course['status'] })}
            >
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : course ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseFormModal;
