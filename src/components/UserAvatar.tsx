
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface UserAvatarProps {
  user: any;
  onLogout: () => void;
}

const UserAvatar = ({ user, onLogout }: UserAvatarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    onLogout();
    setIsOpen(false);
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
  };

  const getInitials = (fullname: string) => {
    return fullname
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'student': { label: 'Học viên', color: 'bg-blue-100 text-blue-800' },
      'teacher': { label: 'Giáo viên', color: 'bg-green-100 text-green-800' },
      'admin': { label: 'Quản trị', color: 'bg-purple-100 text-purple-800' }
    };
    return roleMap[role] || { label: 'Người dùng', color: 'bg-gray-100 text-gray-800' };
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={user.fullname} />
            <AvatarFallback className="bg-primary-600 text-white">
              {getInitials(user.fullname)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url} alt={user.fullname} />
              <AvatarFallback className="bg-primary-600 text-white text-lg">
                {getInitials(user.fullname)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user.fullname}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Username: </span>
              <span className="font-medium">{user.username}</span>
            </div>
            {user.phone_number && (
              <div className="text-sm">
                <span className="text-gray-600">Điện thoại: </span>
                <span className="font-medium">{user.phone_number}</span>
              </div>
            )}
            {user.age && (
              <div className="text-sm">
                <span className="text-gray-600">Tuổi: </span>
                <span className="font-medium">{user.age}</span>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserAvatar;
