import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, X, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadCourseImage, deleteCourseImage } from '@/lib/storage-helpers';

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image_url?: string;
  status?: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
  detail_lessons?: string;
  student_target?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EditCoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image_url: '',
    status: '' as Course['status'] | '',
    detail_lessons: '',
    student_target: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      setCourse(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        price: data.price ? data.price.toString() : '',
        duration: data.duration ? data.duration.toString() : '',
        image_url: data.image_url || '',
        status: data.status || '',
        detail_lessons: data.detail_lessons || '',
        student_target: (data as any).student_target || ''
      });
      setImagePreview(data.image_url || '');
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin khóa học",
        variant: "destructive",
      });
      navigate('/admin?tab=courses');
    } finally {
      setLoadingCourse(false);
    }
  };

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
        status: formData.status || 'Đang mở',
        detail_lessons: formData.detail_lessons.trim() || null,
        student_target: formData.student_target.trim() || null,
        updated_at: new Date().toISOString()
      };

      // Nếu có ảnh mới, xóa ảnh cũ và upload ảnh mới
      if (imageFile && course) {
        if (course.image_url) {
          await deleteCourseImage(course.image_url);
        }
        const imageUrl = await uploadCourseImage(imageFile, course.id);
        courseData.image_url = imageUrl;
      }

      // Update course
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã cập nhật khóa học thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });

      navigate('/admin?tab=courses');
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

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#02458b] absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
          <Button onClick={() => navigate('/admin?tab=courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-roboto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin?tab=courses')}
            className="mb-4 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#02458b] rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa khóa học</h1>
              <p className="text-gray-600">Cập nhật thông tin khóa học</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-[#02458b] text-white rounded-t-lg">
            <CardTitle>Thông tin khóa học</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Tên khóa học *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-300 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="border-gray-300 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_target">Đối tượng học viên</Label>
                <Input
                  id="student_target"
                  value={formData.student_target}
                  onChange={(e) => setFormData({ ...formData, student_target: e.target.value })}
                  className="border-gray-300 focus:border-[#02458b]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="detail_lessons">Chi tiết các buổi học</Label>
                <Textarea
                  id="detail_lessons"
                  value={formData.detail_lessons}
                  onChange={(e) => setFormData({ ...formData, detail_lessons: e.target.value })}
                  rows={6}
                  placeholder="Nhập chi tiết từng buổi học, ví dụ:
Buổi 1: Giới thiệu cơ bản - Học về tư thế, cách cầm micro
Buổi 2: Kỹ thuật phát âm - Luyện tập phát âm rõ ràng
..."
                  className="border-gray-300 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Số buổi học</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="border-gray-300 focus:border-indigo-500"
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Course['status'] })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang mở">Đang mở</SelectItem>
                    <SelectItem value="Đang bắt đầu">Đang bắt đầu</SelectItem>
                    <SelectItem value="Kết thúc">Kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin?tab=courses')}
                  className="px-6"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#02458b] hover:bg-[#02458b]/90 px-6"
                >
                  {isLoading ? 'Đang lưu...' : 'Cập nhật khóa học'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCoursePage; 