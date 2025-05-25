
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: 'student' | 'teacher' | 'admin';
  age?: number;
  phone_number?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSaved: () => void;
}

const UserFormModal = ({ isOpen, onClose, user, onSaved }: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullname: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    age: '',
    phone_number: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // Don't pre-fill password for security
        fullname: user.fullname,
        role: user.role,
        age: user.age ? user.age.toString() : '',
        phone_number: user.phone_number || ''
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        fullname: '',
        role: 'student',
        age: '',
        phone_number: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        fullname: formData.fullname,
        role: formData.role,
        age: formData.age ? parseInt(formData.age) : null,
        phone_number: formData.phone_number || null,
        ...(formData.password && { password: formData.password })
      };

      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update(userData)
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin người dùng",
          className: "bg-green-50 border-green-200 text-green-900",
        });
      } else {
        // Create new user
        if (!formData.password) {
          toast({
            title: "Lỗi",
            description: "Vui lòng nhập mật khẩu cho người dùng mới",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('profiles')
          .insert([userData]);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Đã tạo người dùng mới thành công",
          className: "bg-green-50 border-green-200 text-green-900",
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Lỗi",
        description: user ? "Không thể cập nhật người dùng" : "Không thể tạo người dùng mới",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fullname">Họ tên</Label>
            <Input
              id="fullname"
              value={formData.fullname}
              onChange={(e) => setFormData({...formData, fullname: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">
              {user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!user}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Vai trò</Label>
              <Select value={formData.role} onValueChange={(value: 'student' | 'teacher' | 'admin') => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Học viên</SelectItem>
                  <SelectItem value="teacher">Giáo viên</SelectItem>
                  <SelectItem value="admin">Quản trị</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="age">Tuổi</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                min="1"
                max="150"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone_number">Số điện thoại</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : user ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormModal;
