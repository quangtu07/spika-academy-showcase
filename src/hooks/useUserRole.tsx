
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "Lỗi",
          description: "Không thể kiểm tra quyền người dùng",
          variant: "destructive",
        });
        setUserRole(null);
      } else {
        setUserRole(profile?.role || null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { userRole, isLoading, checkUserRole };
};
