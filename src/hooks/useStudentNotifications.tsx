
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentNotification {
  id: string;
  type: 'graded' | 'pending';
  assignment_title: string;
  lesson_title: string;
  class_name: string;
  updated_at: string;
  submission_id?: string;
  assignment_id?: string;
}

export const useStudentNotifications = (studentId: string | null) => {
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch graded submissions (recently graded)
      const { data: gradedSubmissions, error: gradedError } = await (supabase as any)
        .from('assignment_submissions')
        .select(`
          id,
          updated_at,
          assignment_id,
          assignment:assignments (
            lesson:lessons (
              title,
              class:classes (
                name
              )
            )
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'Đã chấm')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (gradedError) throw gradedError;

      // Fetch pending assignments (not submitted yet)
      const { data: pendingAssignments, error: pendingError } = await (supabase as any)
        .from('assignments')
        .select(`
          id,
          created_at,
          lesson:lessons (
            title,
            class:classes (
              name,
              enrollments!inner (
                student_id
              )
            )
          )
        `)
        .eq('lessons.classes.enrollments.student_id', studentId)
        .not('id', 'in', `(
          SELECT assignment_id 
          FROM assignment_submissions 
          WHERE student_id = '${studentId}'
        )`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (pendingError) throw pendingError;

      const formattedGraded = gradedSubmissions?.map((submission: any) => ({
        id: `graded-${submission.id}`,
        type: 'graded' as const,
        assignment_title: 'Bài tập',
        lesson_title: submission.assignment?.lesson?.title || 'Không xác định',
        class_name: submission.assignment?.lesson?.class?.name || 'Không xác định',
        updated_at: submission.updated_at,
        submission_id: submission.id
      })) || [];

      const formattedPending = pendingAssignments?.map((assignment: any) => ({
        id: `pending-${assignment.id}`,
        type: 'pending' as const,
        assignment_title: 'Bài tập',
        lesson_title: assignment.lesson?.title || 'Không xác định',
        class_name: assignment.lesson?.class?.name || 'Không xác định',
        updated_at: assignment.created_at,
        assignment_id: assignment.id
      })) || [];

      const allNotifications = [...formattedGraded, ...formattedPending]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching student notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription for graded submissions
    const channel = supabase
      .channel('student-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
          filter: `student_id=eq.${studentId}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  return {
    notifications,
    isLoading,
    notificationCount: notifications.length,
    refetch: fetchNotifications
  };
};
