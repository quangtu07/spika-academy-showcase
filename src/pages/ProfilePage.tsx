
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    age: '',
    phone_number: '',
    avatar_url: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/');
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      setFormData({
        username: userData.username || '',
        fullname: userData.fullname || '',
        age: userData.age || '',
        phone_number: userData.phone_number || '',
        avatar_url: userData.avatar_url || ''
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        avatar_url: previewUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call for updating user profile
      const updatedUser = {
        ...user,
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };

      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: "Cập nhật thành công",
        description: "Thông tin hồ sơ đã được cập nhật!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (fullname) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Hồ sơ cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar_url} alt={formData.fullname} />
                    <AvatarFallback className="bg-primary-600 text-white text-2xl">
                      {getInitials(formData.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>Thay đổi ảnh đại diện</span>
                      </Button>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullname">Họ và tên</Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div className="space-y-2">
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

                  <div className="space-y-2">
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

                <div className="flex justify-center space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/')}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
