
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminToolbar from '@/components/admin/AdminToolbar';

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
      'student': { label: 'Học viên', color: 'bg-[#02458b] text-white border-[#02458b]' },
      'teacher': { label: 'Giáo viên', color: 'bg-[#1294fb] text-white border-[#1294fb]' },
      'admin': { label: 'Quản trị', color: 'bg-[#ffc418] text-gray-900 border-[#ffc418]' }
    };
    const roleInfo = roleMap[role] || { label: 'Không xác định', color: 'bg-gray-500 text-white border-gray-500' };
    return <Badge className={`${roleInfo.color} px-3 py-1 text-sm font-medium`}>{roleInfo.label}</Badge>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#02458b] border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">Không tìm thấy người dùng</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Người dùng không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/admin')} className="w-full bg-[#02458b] hover:bg-[#02458b]/90 text-white py-3">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminToolbar 
        title={userData.fullname} 
        subtitle="Chi tiết thông tin người dùng" 
      />

      {/* Main Content với design đẹp */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="px-8 py-8">
            {/* Avatar và thông tin chính */}
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={userData.avatar_url} alt={userData.fullname} />
                  <AvatarFallback className="bg-gradient-to-br from-[#02458b] to-[#1294fb] text-white text-4xl font-bold">
                    {getInitials(userData.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  {getRoleBadge(userData.role)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{userData.fullname}</h2>
                  <p className="text-lg text-gray-600">@{userData.username}</p>
                </div>
              </div>
            </div>

            {/* Grid thông tin chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Thông tin liên hệ */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-[#02458b]" />
                  </div>
                  Thông tin liên hệ
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#02458b]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#1294fb]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium text-gray-900">{userData.phone_number || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-[#ffc418]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tuổi</p>
                      <p className="font-medium text-gray-900">{userData.age || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin hệ thống */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-[#02458b]" />
                  </div>
                  Thông tin hệ thống
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#02458b]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
                        <p className="font-medium text-gray-900">{formatDateTime(userData.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#1294fb]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lần cập nhật cuối</p>
                        <p className="font-medium text-gray-900">
                          {userData.updated_at ? formatDateTime(userData.updated_at) : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-[#ffc418]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID người dùng</p>
                        <p className="font-mono text-sm text-gray-700 bg-white px-2 py-1 rounded border">
                          {userData.id}
                        </p>
                      </div>
                    </div>
                  </div>
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
