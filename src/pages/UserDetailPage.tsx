
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, UserCheck, GraduationCap, MapPin, Clock } from 'lucide-react';
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
      'student': { 
        label: 'Học viên', 
        color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md',
        icon: UserCheck
      },
      'teacher': { 
        label: 'Giáo viên', 
        color: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md',
        icon: GraduationCap
      },
      'admin': { 
        label: 'Quản trị', 
        color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md',
        icon: Shield
      }
    };
    const roleInfo = roleMap[role] || roleMap.student;
    const Icon = roleInfo.icon;
    
    return (
      <Badge className={`${roleInfo.color} px-4 py-2 text-sm font-medium flex items-center space-x-2`}>
        <Icon className="h-4 w-4" />
        <span>{roleInfo.label}</span>
      </Badge>
    );
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">Không tìm thấy người dùng</CardTitle>
            <CardDescription className="text-red-100">
              Người dùng không tồn tại hoặc đã bị xóa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <Button onClick={() => navigate('/admin')} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              Quay lại trang quản lý
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200 text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Chi tiết người dùng
                </h1>
                <p className="text-sm text-gray-600">Thông tin chi tiết và hoạt động</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-xl border-0 overflow-hidden">
          {/* Cover Background */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          
          <CardContent className="relative px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={userData.avatar_url} alt={userData.fullname} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl font-bold">
                  {getInitials(userData.fullname)}
                </AvatarFallback>
              </Avatar>
              
              {/* User Info */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{userData.fullname}</h2>
                    <p className="text-lg text-gray-600">@{userData.username}</p>
                  </div>
                  {getRoleBadge(userData.role)}
                </div>
                
                {/* Quick Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{userData.email}</span>
                  </div>
                  
                  {userData.phone_number && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium">{userData.phone_number}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">Tham gia {formatDateTime(userData.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cá nhân</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Họ tên đầy đủ</span>
                  <span className="text-lg font-semibold text-gray-900">{userData.fullname}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tên đăng nhập</span>
                  <span className="text-lg font-semibold text-gray-900">@{userData.username}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</span>
                  <span className="text-lg font-semibold text-gray-900">{userData.email}</span>
                </div>
                
                {userData.phone_number && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Số điện thoại</span>
                    <span className="text-lg font-semibold text-gray-900">{userData.phone_number}</span>
                  </div>
                )}
                
                {userData.age && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tuổi</span>
                    <span className="text-lg font-semibold text-gray-900">{userData.age} tuổi</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Vai trò</span>
                  {getRoleBadge(userData.role)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Thông tin tài khoản</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ngày tạo tài khoản</span>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatDateTime(userData.created_at)}</p>
                  </div>
                </div>
                
                {userData.updated_at && (
                  <div className="flex justify-between items-start py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cập nhật lần cuối</span>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatDateTime(userData.updated_at)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">ID người dùng</span>
                  <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{userData.id}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Trạng thái</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
