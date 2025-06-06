
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useStudentNotifications } from '@/hooks/useStudentNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudentNotificationBellProps {
  studentId: string | null;
}

const StudentNotificationBell = ({ studentId }: StudentNotificationBellProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { notifications, notificationCount, isLoading } = useStudentNotifications(studentId);

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'graded' && notification.submission_id) {
      navigate(`/student/submission/${notification.submission_id}`);
    } else if (notification.type === 'pending' && notification.assignment_id) {
      // Navigate to lesson assignments page where they can submit
      navigate(`/student/lesson/${notification.assignment_id}/assignments`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="relative p-2">
        <Bell className="h-5 w-5 text-gray-400" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
          <Bell className={`h-5 w-5 ${notificationCount > 0 ? 'text-indigo-600' : 'text-gray-500'} transition-colors`} />
          {notificationCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow-lg animate-pulse"
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className={`${isMobile ? 'w-80' : 'w-96'} max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-xl`}
      >
        <DropdownMenuLabel className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent px-4 py-3">
          THÔNG BÁO ({notificationCount})
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gradient-to-r from-indigo-200 to-purple-200" />

        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Không có thông báo nào</p>
            <p className="text-xs text-gray-400 mt-1">Tất cả bài tập đã được xử lý</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-4 cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border-b border-gray-100 last:border-b-0 transition-all duration-200"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="w-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">
                      {notification.type === 'graded' ? 'Bài tập đã được chấm từ:' : 'Bài tập chưa nộp từ:'}
                    </p>
                    <p className="text-sm font-semibold text-indigo-700 truncate mb-1">
                      {notification.lesson_title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lớp: <span className="font-medium">{notification.class_name}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-3 flex-shrink-0 bg-gray-100 px-2 py-1 rounded-full">
                    {formatTimeAgo(notification.updated_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge className={`${
                    notification.type === 'graded' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  } text-white border-0 text-xs font-bold shadow-md`}>
                    {notification.type === 'graded' ? 'ĐÃ CHẤM' : 'CHƯA NỘP'}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    {notification.type === 'graded' ? 'Nhấn để xem kết quả →' : 'Nhấn để nộp bài →'}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gradient-to-r from-indigo-200 to-purple-200" />
            <div className="p-3">
              <Button 
                variant="ghost" 
                className="w-full text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
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
