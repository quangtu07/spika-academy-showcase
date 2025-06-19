
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { uploadCourseImage, deleteCourseImage } from '@/lib/storage-helpers';
import { useIsMobile } from '@/hooks/use-mobile';

interface Course {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  image_url?: string;
  status?: 'Đang mở' | 'Đang bắt đầu' | 'Kết thúc';
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CourseFormPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditing = !!courseId;
  const isMobile = useIsMobile();
  
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
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
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
    if (isEditing && courseId) {
      fetchCourse();
    }
  }, [courseId, isEditing]);

  const fetchCourse = async () => {
    if (!courseId) return;
    
    setIsLoadingCourse(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          duration: data.duration ? data.duration.toString() : '',
          image_url: data.image_url || '',
          status: data.status || '' as Course['status'] | ''
        });
        setImagePreview(data.image_url || '');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin khóa học",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setIsLoadingCourse(false);
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
        status: formData.status || 'Đang mở', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isEditing && courseId) {
        // Nếu đang edit và có ảnh mới, xóa ảnh cũ và upload ảnh mới
        if (imageFile) {
          if (formData.image_url) {
            await deleteCourseImage(formData.image_url);
          }
          const imageUrl = await uploadCourseImage(imageFile, courseId);
          courseData.image_url = imageUrl;
        }
        courseData.updated_at = new Date().toISOString();

        // Update course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', courseId);
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
        description: `Đã ${isEditing ? 'cập nhật' : 'thêm'} khóa học thành công`,
        className: "bg-green-50 border-green-200 text-green-900",
      });

      navigate('/admin', { state: { activeTab: 'courses' } });
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

  const handleBack = () => {
    navigate('/admin', { state: { activeTab: 'courses' } });
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-lg sm:text-2xl">
                  {isEditing ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
                </CardTitle>
                <p className="text-indigo-100 mt-1 text-sm">
                  {isEditing ? 'Cập nhật thông tin khóa học' : 'Tạo khóa học mới trong hệ thống'}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Tên khóa học <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Nhập tên khóa học"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Mô tả
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 min-h-[120px]"
                      placeholder="Nhập mô tả khóa học"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                        Giá (VNĐ)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                        Số buổi học
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="0"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                      Trạng thái
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Course['status'] })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Đang mở">Đang mở</SelectItem>
                        <SelectItem value="Đang bắt đầu">Đang bắt đầu</SelectItem>
                        <SelectItem value="Kết thúc">Kết thúc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Ảnh khóa học
                      </Label>
                      <div className="space-y-4">
                        {imagePreview && (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                            <img
                              src={imagePreview}
                              alt="Course preview"
                              className="object-cover w-full h-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
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
                            className="w-full border-gray-300 hover:bg-purple-50 hover:border-purple-300"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {imagePreview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Chỉ chấp nhận file JPG, PNG, WebP. Kích thước tối đa 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                >
                  {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseFormPage;
