import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowUpDown, Upload, GraduationCap, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
      'student': { label: 'Học viên', color: 'bg-blue-100 text-blue-800' },
      'teacher': { label: 'Giáo viên', color: 'bg-green-100 text-green-800' },
      'admin': { label: 'Quản trị', color: 'bg-purple-100 text-purple-800' }
    };
    const roleInfo = roleMap[role] || { label: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    return <Badge className={roleInfo.color}>{roleInfo.label}</Badge>;
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

  const renderUserTable = (roleFilter: string) => {
    const sortedUsers = getSortedUsers(roleFilter);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh đại diện</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('username')}
                className="flex items-center space-x-1 p-0 h-auto font-medium"
              >
                <span>Tên đăng nhập</span>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('fullname')}
                className="flex items-center space-x-1 p-0 h-auto font-medium"
              >
                <span>Họ tên</span>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('email')}
                className="flex items-center space-x-1 p-0 h-auto font-medium"
              >
                <span>Email</span>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('phone_number')}
                className="flex items-center space-x-1 p-0 h-auto font-medium"
              >
                <span>Điện thoại</span>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url} alt={user.fullname} />
                  <AvatarFallback className="bg-primary-600 text-white">
                    {getInitials(user.fullname)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.fullname}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone_number || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingUser(user)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewUserDetail(user)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
          <CardDescription>Đang tải dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>
                Quản lý tất cả tài khoản người dùng theo vai trò
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleAddUser} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Thêm người dùng</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="student">
                Học viên ({users.filter(u => u.role === 'student').length})
              </TabsTrigger>
              <TabsTrigger value="teacher">
                Giáo viên ({users.filter(u => u.role === 'teacher').length})
              </TabsTrigger>
              <TabsTrigger value="admin">
                Quản trị ({users.filter(u => u.role === 'admin').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-6">
              {renderUserTable('student')}
            </TabsContent>

            <TabsContent value="teacher" className="mt-6">
              {renderUserTable('teacher')}
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              {renderUserTable('admin')}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng "{deletingUser?.fullname}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUser && handleDeleteUser(deletingUser.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserManagement;
