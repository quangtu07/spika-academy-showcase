
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PendingSubmission {
  id: string;
  student_name: string;
  assignment_title: string;
  lesson_title: string;
  submitted_at: string;
  assignment_id: string;
}

export const useTeacherNotifications = (teacherId: string | null) => {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingSubmissions = async () => {
    if (!teacherId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('assignment_submissions')
        .select(`
          id,
          submitted_at,
          assignment_id,
          student:profiles (
            fullname
          ),
          assignment:assignments (
            lesson:lessons (
              title,
              class:classes (
                instructor_id
              )
            )
          )
        `)
        .eq('status', 'Đang chờ chấm')
        .eq('assignments.lessons.classes.instructor_id', teacherId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const formattedSubmissions = data?.map((submission: any) => ({
        id: submission.id,
        student_name: submission.student?.fullname || 'Không xác định',
        assignment_title: 'Bài tập',
        lesson_title: submission.assignment?.lesson?.title || 'Không xác định',
        submitted_at: submission.submitted_at,
        assignment_id: submission.assignment_id
      })) || [];

      setPendingSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubmissions();

    // Set up real-time subscription for new submissions
    const channel = supabase
      .channel('teacher-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
          filter: `status=eq.Đang chờ chấm`
        },
        () => {
          fetchPendingSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teacherId]);

  return {
    pendingSubmissions,
    isLoading,
    pendingCount: pendingSubmissions.length,
    refetch: fetchPendingSubmissions
  };
};
