import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowUpDown, Upload, GraduationCap, ArrowRight, Users, UserCheck, Shield, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import UserFormModal from './UserFormModal';
import EnrollmentFormModal from './EnrollmentFormModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: 'student' | 'teacher' | 'admin';
  age?: number;
  phone_number?: string;
  created_at: string;
  avatar_url?: string;
}

type SortField = 'fullname' | 'age' | 'username' | 'email' | 'phone_number';
type SortOrder = 'asc' | 'desc';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('student');
  const [sortField, setSortField] = useState<SortField>('fullname');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Kiểm tra nếu có userRoleTab từ state khi quay lại từ UserDetailPage
    if (location.state?.userRoleTab) {
      setActiveTab(location.state.userRoleTab);
      // Xóa state để tránh việc lưu trữ không cần thiết
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleUserSaved = () => {
    fetchUsers();
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleEnrollmentSaved = () => {
    toast({
      title: "Thành công",
      description: "Đã đăng ký khóa học thành công",
      className: "bg-green-50 border-green-200 text-green-900",
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedUsers = (roleFilter: string) => {
    const filteredUsers = users.filter(user => user.role === roleFilter);
    
    return filteredUsers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'fullname') {
        aValue = a.fullname.toLowerCase();
        bValue = b.fullname.toLowerCase();
      } else if (sortField === 'age') {
        aValue = a.age || 0;
        bValue = b.age || 0;
      } else if (sortField === 'username') {
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
      } else if (sortField === 'email') {
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
      } else if (sortField === 'phone_number') {
        aValue = a.phone_number || '';
        bValue = b.phone_number || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'student': { label: 'Học viên', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'teacher': { label: 'Giáo viên', color: 'bg-green-100 text-green-800 border-green-200' },
      'admin': { label: 'Quản trị', color: 'bg-purple-100 text-purple-800 border-purple-200' }
    };
    const roleInfo = roleMap[role] || { label: 'Không xác định', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge className={`${roleInfo.color} border px-3 py-1 font-medium`}>{roleInfo.label}</Badge>;
  };

  const handleAvatarUpload = async (userId: string, file: File) => {
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // 4. Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, avatar_url: publicUrl }
          : user
      ));

      toast({
        title: "Thành công",
        description: "Đã cập nhật ảnh đại diện",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh đại diện",
        variant: "destructive",
      });
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

  const handleViewUserDetail = (user: User) => {
    const roleTab = user.role === 'student' ? 'student' : 
                   user.role === 'teacher' ? 'teacher' : 'admin';
    navigate(`/admin/user/${user.id}?tab=${roleTab}`);
  };

  const getTabConfig = (role: string) => {
    const configs = {
      'student': {
        icon: UserCheck,
        gradient: 'from-[#1294fb] to-[#02458b]',
        bgGradient: 'from-blue-50 to-indigo-50'
      },
      'teacher': {
        icon: GraduationCap,
        gradient: 'from-[#02458b] to-[#1294fb]',
        bgGradient: 'from-blue-50 to-indigo-50'
      },
      'admin': {
        icon: Shield,
        gradient: 'from-[#02458b] to-[#1294fb]',
        bgGradient: 'from-blue-50 to-indigo-50'
      }
    };
    return configs[role] || configs.student;
  };

  const renderMobileUserCards = (roleFilter: string) => {
    const sortedUsers = getSortedUsers(roleFilter);
    const config = getTabConfig(roleFilter);

    return (
      <div className="space-y-4">
        <div className={`bg-gradient-to-r ${config.bgGradient} rounded-2xl p-4 border border-gray-100`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <config.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {roleFilter === 'student' ? 'Học viên' : 
                 roleFilter === 'teacher' ? 'Giáo viên' : 'Quản trị'}
              </h3>
              <p className="text-sm text-gray-600">
                {sortedUsers.length} người
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {sortedUsers.map((user) => (
            <Card key={user.id} className="shadow-md border-0 bg-white overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-14 w-14 shadow-lg border-2 border-white">
                    <AvatarImage src={user.avatar_url} alt={user.fullname} />
                    <AvatarFallback className={`bg-gradient-to-r ${config.gradient} text-white font-semibold text-lg`}>
                      {getInitials(user.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{user.fullname}</h4>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone_number && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone_number}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUserDetail(user)}
                        className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderDesktopUserTable = (roleFilter: string) => {
    const sortedUsers = getSortedUsers(roleFilter);
    const config = getTabConfig(roleFilter);

    return (
      <div className="space-y-6">
        <div className={`bg-gradient-to-r ${config.bgGradient} rounded-2xl p-6 border border-gray-100`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <config.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {roleFilter === 'student' ? 'Danh sách học viên' : 
                 roleFilter === 'teacher' ? 'Danh sách giáo viên' : 'Danh sách quản trị viên'}
              </h3>
              <p className="text-gray-600">
                Tổng cộng {sortedUsers.length} {roleFilter === 'student' ? 'học viên' : 
                roleFilter === 'teacher' ? 'giáo viên' : 'quản trị viên'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Ảnh đại diện</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('username')}
                    className="flex items-center space-x-1 p-0 h-auto font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <span>Tên đăng nhập</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('fullname')}
                    className="flex items-center space-x-1 p-0 h-auto font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <span>Họ tên</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('email')}
                    className="flex items-center space-x-1 p-0 h-auto font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <span>Email</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('phone_number')}
                    className="flex items-center space-x-1 p-0 h-auto font-semibold text-gray-700 hover:text-gray-900"
                  >
                    <span>Điện thoại</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user, index) => (
                <TableRow 
                  key={user.id} 
                  className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                >
                  <TableCell>
                    <Avatar className="h-12 w-12 shadow-md">
                      <AvatarImage src={user.avatar_url} alt={user.fullname} />
                      <AvatarFallback className={`bg-gradient-to-r ${config.gradient} text-white font-semibold`}>
                        {getInitials(user.fullname)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{user.username}</TableCell>
                  <TableCell className="font-medium text-gray-900">{user.fullname}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{user.phone_number || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUserDetail(user)}
                        className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderUserContent = (roleFilter: string) => {
    return isMobile ? renderMobileUserCards(roleFilter) : renderDesktopUserTable(roleFilter);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-[#02458b] text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 md:h-8 md:w-8" />
              <div>
                <CardTitle className="text-xl md:text-2xl">Quản lý người dùng</CardTitle>
              <CardDescription className="text-blue-100 text-sm md:text-base">
                  Đang tải dữ liệu...
                </CardDescription>
              </div>
            </div>
        </CardHeader>
          <CardContent className="p-4 md:p-8">
          <div className="animate-pulse space-y-4">
              {[...Array(isMobile ? 3 : 5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-[#02458b] text-white rounded-t-lg">
          <div className={`${isMobile ? 'space-y-4' : 'flex justify-between items-center'}`}>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 md:h-8 md:w-8" />
              <div>
                <CardTitle className="text-lg md:text-2xl">Quản lý người dùng</CardTitle>
                <CardDescription className="text-blue-100 mt-1 text-sm md:text-base">
                  Quản lý tất cả tài khoản người dùng theo vai trò
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleAddUser} 
              className={`bg-white text-[#02458b] hover:bg-gray-100 border-0 shadow-lg ${isMobile ? 'w-full' : ''}`}
              size={isMobile ? "default" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Thêm người dùng</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
            <TabsList className={`grid w-full grid-cols-3 bg-gradient-to-r from-blue-100 to-indigo-100 p-1 rounded-xl shadow-inner ${isMobile ? 'h-12' : 'h-14'}`}>
              <TabsTrigger 
                value="student"
                className="flex items-center justify-center space-x-1 md:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 rounded-lg transition-all duration-200 text-xs md:text-sm"
              >
                <UserCheck className="h-3 w-3 md:h-4 md:w-4" />
                <span className="font-medium">
                  {isMobile ? `HV (${users.filter(u => u.role === 'student').length})` : `Học viên (${users.filter(u => u.role === 'student').length})`}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="teacher"
                className="flex items-center justify-center space-x-1 md:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-700 rounded-lg transition-all duration-200 text-xs md:text-sm"
              >
                <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
                <span className="font-medium">
                  {isMobile ? `GV (${users.filter(u => u.role === 'teacher').length})` : `Giáo viên (${users.filter(u => u.role === 'teacher').length})`}
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="flex items-center justify-center space-x-1 md:space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 rounded-lg transition-all duration-200 text-xs md:text-sm"
              >
                <Shield className="h-3 w-3 md:h-4 md:w-4" />
                <span className="font-medium">
                  {isMobile ? `QT (${users.filter(u => u.role === 'admin').length})` : `Quản trị (${users.filter(u => u.role === 'admin').length})`}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-4 md:mt-6">
              {renderUserContent('student')}
            </TabsContent>

            <TabsContent value="teacher" className="mt-4 md:mt-6">
              {renderUserContent('teacher')}
            </TabsContent>

            <TabsContent value="admin" className="mt-4 md:mt-6">
              {renderUserContent('admin')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSaved={handleUserSaved}
      />

      <EnrollmentFormModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        onSaved={handleEnrollmentSaved}
      />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-800">Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn xóa người dùng "{deletingUser?.fullname}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-100">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUser && handleDeleteUser(deletingUser.id)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
