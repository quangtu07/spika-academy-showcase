
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
        badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs font-bold shadow-md',
        time: null
      };
    } else if (notification.status === 'Đã hoàn thành' && notification.feedback) {
      return {
        title: 'BÀI ĐÃ ĐƯỢC CHẤM',
        badgeClass: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs font-bold shadow-md',
        time: notification.submitted_at
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="relative p-2">
        <Bell className="h-5 w-5 text-gray-400" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
          <Bell className={`h-5 w-5 ${notifications.length > 0 ? 'text-blue-600' : 'text-gray-500'} transition-colors`} />
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow-lg animate-pulse"
            >
              {notifications.length > 99 ? '99+' : notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align={isMobile ? "center" : "end"} 
        className={`${isMobile ? 'w-80' : 'w-96'} max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-xl`}
      >
        <DropdownMenuLabel className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-4 py-3">
          THÔNG BÁO ({notifications.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gradient-to-r from-blue-200 to-purple-200" />

        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Không có thông báo mới</p>
            <p className="text-xs text-gray-400 mt-1">Tất cả bài tập đã được cập nhật</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const notificationInfo = getNotificationInfo(notification);
            if (!notificationInfo) return null;

            return (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-b border-gray-100 last:border-b-0 transition-all duration-200"
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-gray-900 mb-1">
                        {notification.assignment.lesson.class.name.toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Buổi {notification.assignment.lesson.lesson_number}: {notification.assignment.lesson.title}
                      </p>
                    </div>
                    {notificationInfo.time && (
                      <span className="text-xs text-gray-500 ml-3 flex-shrink-0 bg-gray-100 px-2 py-1 rounded-full">
                        {formatTimeAgo(notificationInfo.time)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <Badge className={notificationInfo.badgeClass}>
                      {notificationInfo.title}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Nhấn để xem chi tiết →
                    </div>
                  </div>

                  {notification.feedback && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 mt-3">
                      <p className="text-green-700 text-sm font-medium mb-1">💬 Nhận xét từ giáo viên:</p>
                      <p className="text-green-800 text-sm italic leading-relaxed">"{notification.feedback}"</p>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gradient-to-r from-blue-200 to-purple-200" />
            <div className="p-3">
              <Button 
                variant="ghost" 
                className="w-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                onClick={() => navigate('/student')}
              >
                XEM TẤT CẢ THÔNG BÁO
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StudentNotificationBell;
