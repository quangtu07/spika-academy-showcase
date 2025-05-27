
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserFormModal from './UserFormModal';

interface User {
  id: string;
  username: string;
  email: string;
  fullname: string;
  role: 'student' | 'teacher' | 'admin';
  age?: number;
  phone_number?: string;
  created_at: string;
}

type SortField = 'fullname' | 'age';
type SortOrder = 'asc' | 'desc';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('student');
  const [sortField, setSortField] = useState<SortField>('fullname');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { toast } = useToast();

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
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

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

  const renderUserTable = (roleFilter: string) => {
    const sortedUsers = getSortedUsers(roleFilter);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên đăng nhập</TableHead>
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
            <TableHead>Email</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('age')}
                className="flex items-center space-x-1 p-0 h-auto font-medium"
              >
                <span>Tuổi</span>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Điện thoại</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.fullname}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.age || '-'}</TableCell>
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
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
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
            <Button onClick={handleAddUser} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Thêm người dùng</span>
            </Button>
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
    </>
  );
};

export default UserManagement;
