
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check for admin status by user_id or email
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .or(`user_id.eq.${user.id},and(user_id.is.null,email.eq.${user.email})`);

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin role:', error);
        }

        setIsAdmin(data && data.length > 0);
      } catch (err) {
        console.error('Error checking admin role:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  return { isAdmin, loading };
};
