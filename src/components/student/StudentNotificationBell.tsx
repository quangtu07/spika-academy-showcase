
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useStudentNotifications } from '@/hooks/useStudentNotifications';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const StudentNotificationBell = () => {
  const { notifications, isLoading } = useStudentNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNotificationClick = (submissionId: string) => {
    navigate(`/student-submission/${submissionId}`);
    setOpen(false);
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Mới';
    const now = new Date();
    const submitted = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const getNotificationInfo = (notification: any) => {
    if (notification.status === 'Chưa làm') {
      return {
        title: 'BÀI TẬP CHƯA LÀM',
        badgeClass: 'bg-amber-500 text-white',
        time: null
      };
    } else if (notification.status === 'Đã hoàn thành' && notification.feedback) {
      return {
        title: 'BÀI ĐÃ ĐƯỢC CHẤM',
        badgeClass: 'bg-green-500 text-white',
        time: notification.submitted_at
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5 text-gray-400" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className={`h-5 w-5 ${notifications.length > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {notifications.length > 99 ? '99+' : notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align={isMobile ? "center" : "end"} 
        className={`${isMobile ? 'w-80' : 'w-96'} max-h-96 overflow-y-auto`}
      >
        <DropdownMenuLabel className="text-lg font-bold">
          Thông báo ({notifications.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Không có thông báo mới</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const notificationInfo = getNotificationInfo(notification);
            if (!notificationInfo) return null;

            return (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 mb-1">
                        {notification.assignment.lesson.class.name}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        Buổi {notification.assignment.lesson.lesson_number}: {notification.assignment.lesson.title}
                      </p>
                    </div>
                    {notificationInfo.time && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTimeAgo(notificationInfo.time)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={notificationInfo.badgeClass}>
                      {notificationInfo.title}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Nhấn để xem →
                    </span>
                  </div>

                  {notification.feedback && (
                    <div className="bg-green-50 p-3 rounded-lg mt-3">
                      <p className="text-green-700 text-xs font-medium mb-1">Nhận xét:</p>
                      <p className="text-green-800 text-xs">"{notification.feedback}"</p>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3">
              <Button 
                variant="ghost" 
                className="w-full text-sm"
                onClick={() => navigate('/student')}
              >
                Xem tất cả thông báo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StudentNotificationBell;
