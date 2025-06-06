
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
  const [viewedNotifications, setViewedNotifications] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load viewed notifications from localStorage on mount
    setViewedNotifications(getViewedNotifications());
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        () => {
          fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments'
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
      
      // Step 1: Get all assignments from classes the student belongs to
      const { data: enrollmentsData, error: enrollmentsError } = await (supabase as any)
        .from('enrollments')
        .select('class_id')
        .eq('student_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      const classIds = enrollmentsData.map((enrollment: any) => enrollment.class_id);
      
      if (classIds.length === 0) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      // Step 2: Get all assignments from those classes
      const { data: assignmentsData, error: assignmentsError } = await (supabase as any)
        .from('assignments')
        .select(`
          id,
          lesson:lessons (
            id,
            title,
            lesson_number,
            class_id,
            classes (
              name
            )
          )
        `)
        .in('lesson.class_id', classIds)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Step 3: Get existing submissions for this student
      const assignmentIds = assignmentsData.map((assignment: any) => assignment.id);
      
      const { data: submissionsData, error: submissionsError } = await (supabase as any)
        .from('assignment_submissions')
        .select('id, assignment_id, status, feedback, submitted_at')
        .eq('student_id', user.id)
        .in('assignment_id', assignmentIds);

      if (submissionsError) throw submissionsError;

      // Step 4: Create notifications
      const submissionsMap = new Map();
      submissionsData.forEach((submission: any) => {
        submissionsMap.set(submission.assignment_id, submission);
      });

      const formattedNotifications: StudentNotification[] = [];

      assignmentsData.forEach((assignment: any) => {
        const submission = submissionsMap.get(assignment.id);
        
        // Create notification for unfinished assignments (no submission or status "Chưa làm")
        if (!submission) {
          formattedNotifications.push({
            id: `new-${assignment.id}`, // Temporary ID for new assignments
            assignment_id: assignment.id,
            student_id: user.id,
            status: 'Chưa làm',
            feedback: null,
            submitted_at: null,
            assignment: {
              lesson: {
                id: assignment.lesson.id,
                title: assignment.lesson.title,
                lesson_number: assignment.lesson.lesson_number,
                class: assignment.lesson.classes || { name: 'Không xác định' }
              }
            }
          });
        } else if (submission.status === 'Chưa làm' || 
                  (submission.status === 'Đã hoàn thành' && submission.feedback)) {
          // Create notification for existing submissions with relevant status
          formattedNotifications.push({
            id: submission.id,
            assignment_id: assignment.id,
            student_id: user.id,
            status: submission.status,
            feedback: submission.feedback,
            submitted_at: submission.submitted_at,
            assignment: {
              lesson: {
                id: assignment.lesson.id,
                title: assignment.lesson.title,
                lesson_number: assignment.lesson.lesson_number,
                class: assignment.lesson.classes || { name: 'Không xác định' }
              }
            }
          });
        }
      });

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

  // Helper function to get viewed notifications from localStorage
  const getViewedNotifications = () => {
    try {
      const viewed = localStorage.getItem('viewedNotifications');
      return viewed ? JSON.parse(viewed) : [];
    } catch {
      return [];
    }
  };

  // Helper function to mark notification as viewed
  const markAsViewed = (notificationId: string) => {
    try {
      const viewed = getViewedNotifications();
      if (!viewed.includes(notificationId)) {
        const newViewed = [...viewed, notificationId];
        setViewedNotifications(newViewed);
        localStorage.setItem('viewedNotifications', JSON.stringify(newViewed));
      }
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
    }
  };

  // Filter out viewed notifications
  const unviewedNotifications = notifications.filter(notification => {
    // Only filter out "Đã hoàn thành" notifications that have been viewed
    if (notification.status === 'Đã hoàn thành' && notification.feedback) {
      return !viewedNotifications.includes(notification.id);
    }
    // Always show "Chưa làm" notifications
    return true;
  });

  return {
    notifications: unviewedNotifications,
    isLoading,
    refreshNotifications: fetchNotifications,
    markAsViewed
  };
};
