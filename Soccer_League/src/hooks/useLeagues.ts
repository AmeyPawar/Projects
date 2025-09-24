
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface League {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  start_date?: string;
  end_date?: string;
  rules?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useLeagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeagues(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLeague = async (leagueData: Omit<League, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .insert([leagueData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchLeagues(); // Refresh the list
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating league:', err);
      return { data: null, error: err.message };
    }
  };

  const updateLeague = async (id: string, updates: Partial<League>) => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchLeagues(); // Refresh the list
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating league:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteLeague = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchLeagues(); // Refresh the list
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting league:', err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  return {
    leagues,
    loading,
    error,
    createLeague,
    updateLeague,
    deleteLeague,
    refetch: fetchLeagues
  };
};
