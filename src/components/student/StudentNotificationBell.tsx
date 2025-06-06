
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

  const getNotificationMessage = (notification: any) => {
    if (notification.status === 'Chưa làm') {
      return {
        title: 'BÀI TẬP CHƯA LÀM',
        description: `Buổi ${notification.assignment.lesson.lesson_number}: ${notification.assignment.lesson.title}`,
        className: 'text-orange-600',
        badgeClassName: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    } else if (notification.status === 'Đã hoàn thành' && notification.feedback) {
      return {
        title: 'BÀI ĐÃ ĐƯỢC CHẤM',
        description: `Buổi ${notification.assignment.lesson.lesson_number}: ${notification.assignment.lesson.title}`,
        className: 'text-green-600',
        badgeClassName: 'bg-green-100 text-green-800 border-green-200'
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-white/20 backdrop-blur-sm"
        >
          <Bell className="h-5 w-5 text-white" />
          {notifications.length > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white border-2 border-white text-xs font-bold"
            >
              {notifications.length > 9 ? '9+' : notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={isMobile ? "center" : "end"} 
        className={`${isMobile ? 'w-80' : 'w-96'} max-h-96 overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl`}
      >
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Không có thông báo mới</p>
            <p className="text-gray-400 text-sm mt-1">Tất cả bài tập đã được cập nhật</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Thông báo ({notifications.length})
              </h3>
            </div>
            
            {notifications.map((notification, index) => {
              const messageInfo = getNotificationMessage(notification);
              if (!messageInfo) return null;

              return (
                <React.Fragment key={notification.id}>
                  <DropdownMenuItem
                    className="p-4 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="w-full space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={`${messageInfo.badgeClassName} font-bold text-xs px-2 py-1`}>
                              {messageInfo.title}
                            </Badge>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            <span className="font-bold">{notification.assignment.lesson.class.name}</span>
                          </p>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {messageInfo.description}
                          </p>
                        </div>
                      </div>
                      
                      {notification.feedback && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 mt-2">
                          <p className="text-green-700 text-sm font-medium mb-1">💬 Nhận xét từ giáo viên:</p>
                          <p className="text-green-800 text-sm italic leading-relaxed">"{notification.feedback}"</p>
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                  
                  {index < notifications.length - 1 && (
                    <DropdownMenuSeparator className="bg-gray-100" />
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StudentNotificationBell;
