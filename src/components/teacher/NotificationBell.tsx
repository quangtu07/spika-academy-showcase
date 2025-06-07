
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
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5 text-gray-500" />
          {pendingCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs hover:bg-red-500"
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
        <DropdownMenuLabel className="text-lg font-bold px-4 py-3">
          Thông báo ({pendingCount})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {pendingSubmissions.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Không có bài tập nào cần chấm</p>
            <p className="text-xs text-gray-400 mt-1">Tất cả bài tập đã được xử lý</p>
          </div>
        ) : (
          pendingSubmissions.map((submission) => (
            <DropdownMenuItem
              key={submission.id}
              className="flex flex-col items-start p-4 cursor-pointer"
              onClick={() => handleNotificationClick(submission.id)}
            >
              <div className="w-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base text-gray-900 mb-1">
                      {submission.student_name}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      đã nộp bài tập từ:
                    </p>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {submission.lesson_title}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 ml-3">
                    {formatTimeAgo(submission.submitted_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge className="bg-blue-500 text-white text-xs">
                    Đang chờ chấm
                  </Badge>
                  <div className="text-xs text-gray-500">
                    Nhấn để chấm bài →
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}

        {pendingSubmissions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3">
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
