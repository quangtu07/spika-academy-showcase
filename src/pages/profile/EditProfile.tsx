import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullname: '',
    age: '',
    phone_number: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      toast({
        title: "Truy cập bị từ chối",
        description: "Vui lòng đăng nhập để tiếp tục",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData({
        fullname: userData.fullname || '',
        age: userData.age?.toString() || '',
        phone_number: userData.phone_number || ''
      });
      if (userData.avatar_url) {
        setAvatarPreview(userData.avatar_url);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      navigate('/');
    }
  }, [navigate, toast]);

  const getInitials = (fullname: string) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Kiểm tra kích thước file (giới hạn 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh không được vượt quá 2MB",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF",
          variant: "destructive",
        });
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploadingAvatar(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload với upsert: true
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Xóa avatar cũ nếu có
      if (user.avatar_url) {
        const oldFileName = user.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
        }
      }

      // Lấy public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = "Không thể tải lên ảnh đại diện";
      if (error.message.includes("row-level security")) {
        errorMessage = "Lỗi phân quyền: Vui lòng đăng nhập lại";
      } else if (error.message.includes("Unauthorized")) {
        errorMessage = "Bạn không có quyền tải lên file";
      }
      
      toast({
        title: "Lỗi tải ảnh",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = user.avatar_url;

      // Upload avatar mới nếu có
      if (avatar) {
        const uploadedUrl = await uploadAvatar(avatar);
        if (!uploadedUrl) {
          throw new Error('Failed to upload avatar');
        }
        avatarUrl = uploadedUrl;
      }

      // Cập nhật profile với avatar_url mới
      const { error } = await supabase
        .from('profiles')
        .update({
          fullname: formData.fullname,
          age: formData.age ? parseInt(formData.age) : null,
          phone_number: formData.phone_number,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Cập nhật lại thông tin user trong localStorage
      const updatedUser = {
        ...user,
        fullname: formData.fullname,
        age: formData.age ? parseInt(formData.age) : null,
        phone_number: formData.phone_number,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công",
      });

      // Reset file input
      setAvatar(null);
      setAvatarPreview(avatarUrl);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-20">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar upload section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={avatarPreview}
                      alt={formData.fullname} 
                    />
                    <AvatarFallback>{getInitials(formData.fullname)}</AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-0 right-0"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Cho phép: JPG, PNG</p>
                  <p>Tối đa: 2MB</p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullname">Họ và tên</Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <Label htmlFor="age">Tuổi</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Nhập tuổi"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Số điện thoại</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật hồ sơ'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile; 