
import { useState, useEffect } from 'react';
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
      // Check if user is logged in by getting from localStorage
      const storedUser = localStorage.getItem('currentUser');
      
      if (!storedUser) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      
      // Get role directly from the stored user data
      if (user && user.role) {
        setUserRole(user.role);
      } else {
        setUserRole(null);
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
