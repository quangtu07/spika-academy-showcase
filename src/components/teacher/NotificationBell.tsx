
import React, { useState } from 'react';
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
import { useTeacherNotifications } from '@/hooks/useTeacherNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

interface NotificationBellProps {
  teacherId: string | null;
}

const NotificationBell = ({ teacherId }: NotificationBellProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { pendingSubmissions, pendingCount, isLoading } = useTeacherNotifications(teacherId);

  const handleNotificationClick = (submissionId: string) => {
    navigate(`/teacher/submission/${submissionId}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const submitted = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60));
    
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
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-blue-50">
          <Bell className={`h-5 w-5 ${pendingCount > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
          {pendingCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className={`${isMobile ? 'w-80' : 'w-96'} max-h-96 overflow-y-auto`}
      >
        <DropdownMenuLabel className="text-base font-semibold">
          Thông báo ({pendingCount})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {pendingSubmissions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Không có bài tập nào cần chấm</p>
          </div>
        ) : (
          pendingSubmissions.map((submission) => (
            <DropdownMenuItem
              key={submission.id}
              className="flex flex-col items-start p-4 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
              onClick={() => handleNotificationClick(submission.id)}
            >
              <div className="w-full">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-sm text-gray-900 truncate flex-1">
                    {submission.student_name}
                  </p>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatTimeAgo(submission.submitted_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  đã nộp bài tập từ buổi học:
                </p>
                <p className="text-xs text-blue-600 font-medium truncate">
                  {submission.lesson_title}
                </p>
                <div className="flex items-center mt-2">
                  <Badge className="bg-amber-500/15 text-amber-700 border-amber-300 text-xs">
                    Đang chờ chấm
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}

        {pendingSubmissions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full text-sm text-blue-600 hover:bg-blue-50"
                onClick={() => navigate('/teacher')}
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

export default NotificationBell;
