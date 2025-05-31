import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: 'student' | 'teacher' | 'admin';
  age?: number;
  phone_number?: string;
  created_at: string;
  updated_at?: string;
  avatar_url?: string;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUserData(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'student': { label: 'Học viên', color: 'bg-blue-100 text-blue-800' },
      'teacher': { label: 'Giáo viên', color: 'bg-green-100 text-green-800' },
      'admin': { label: 'Quản trị', color: 'bg-purple-100 text-purple-800' }
    };
    const roleInfo = roleMap[role] || { label: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    return <Badge className={roleInfo.color}>{roleInfo.label}</Badge>;
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

  const handleGoBack = () => {
    const roleTab = searchParams.get('tab');
    navigate('/admin', {
      replace: true,
      state: { 
        activeTab: 'users',
        userRoleTab: roleTab || 'student'
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Không tìm thấy người dùng</CardTitle>
            <CardDescription>
              Người dùng không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/admin')} className="w-full">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userData.fullname}</h1>
                <p className="text-sm text-gray-600">Chi tiết người dùng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.avatar_url} alt={userData.fullname} />
                    <AvatarFallback className="bg-primary-600 text-white text-xl">
                      {getInitials(userData.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">{userData.fullname}</div>
                    <div className="text-sm text-gray-500">{userData.username}</div>
                    <div className="mt-2">{getRoleBadge(userData.role)}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> {userData.email}</div>
                  <div><strong>Số điện thoại:</strong> {userData.phone_number || 'Chưa cập nhật'}</div>
                  <div><strong>Tuổi:</strong> {userData.age || 'Chưa cập nhật'}</div>
                  <div><strong>Ngày tạo:</strong> {formatDateTime(userData.created_at)}</div>
                  <div><strong>Lần cập nhật cuối:</strong> {userData.updated_at ? formatDateTime(userData.updated_at) : 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailPage; 