
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StudentProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    phone_number: '',
    age: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser) {
      setProfile(currentUser);
      setEditForm({
        fullname: currentUser.fullname || '',
        phone_number: currentUser.phone_number || '',
        age: currentUser.age?.toString() || ''
      });
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      fullname: profile.fullname || '',
      phone_number: profile.phone_number || '',
      age: profile.age?.toString() || ''
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        fullname: editForm.fullname,
        phone_number: editForm.phone_number || null,
        age: editForm.age ? parseInt(editForm.age) : null
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      // Update local storage
      const updatedProfile = { ...profile, ...updateData };
      localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setIsEditing(false);

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cá nhân",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (fullname: string) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
        <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} alt={profile?.fullname} />
                <AvatarFallback className="bg-primary-600 text-white text-lg">
                  {getInitials(profile?.fullname || profile?.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{profile?.fullname || profile?.username}</CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  onClick={handleSave} 
                  size="sm"
                  disabled={isSaving}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">
                  Họ và tên
                </Label>
                {isEditing ? (
                  <Input
                    id="fullname"
                    value={editForm.fullname}
                    onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.fullname || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{profile?.email}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Số điện thoại
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.phone_number || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                  Tuổi
                </Label>
                {isEditing ? (
                  <Input
                    id="age"
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    placeholder="Nhập tuổi"
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.age || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
