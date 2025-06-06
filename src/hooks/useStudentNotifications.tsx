
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudentNotification {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'Chưa làm' | 'Đang chờ chấm' | 'Đã hoàn thành';
  feedback: string | null;
  submitted_at: string | null;
  assignment: {
    lesson: {
      id: string;
      title: string;
      lesson_number: number;
      class: {
        name: string;
      };
    };
  };
}

export const useStudentNotifications = () => {
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('student-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      
      const { data, error } = await (supabase as any)
        .from('assignment_submissions')
        .select(`
          id,
          assignment_id,
          student_id,
          status,
          feedback,
          submitted_at,
          assignment:assignments (
            lesson:lessons (
              id,
              title,
              lesson_number,
              classes (
                name
              )
            )
          )
        `)
        .eq('student_id', user.id)
        .in('status', ['Chưa làm', 'Đã hoàn thành'])
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications = data.map((item: any) => ({
        id: item.id,
        assignment_id: item.assignment_id,
        student_id: item.student_id,
        status: item.status,
        feedback: item.feedback,
        submitted_at: item.submitted_at,
        assignment: {
          lesson: {
            id: item.assignment.lesson.id,
            title: item.assignment.lesson.title,
            lesson_number: item.assignment.lesson.lesson_number,
            class: item.assignment.lesson.classes || { name: 'Không xác định' }
          }
        }
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching student notifications:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông báo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notifications to show only relevant ones
  const relevantNotifications = notifications.filter(notification => {
    // Show "Chưa làm" (unfinished assignments) or "Đã hoàn thành" with feedback
    return notification.status === 'Chưa làm' || 
           (notification.status === 'Đã hoàn thành' && notification.feedback);
  });

  return {
    notifications: relevantNotifications,
    isLoading,
    refreshNotifications: fetchNotifications
  };
};
