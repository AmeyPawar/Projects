
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Team {
  id: string;
  league_id?: string;
  name: string;
  logo_url?: string;
  captain_name?: string;
  captain_email?: string;
  created_at?: string;
  updated_at?: string;
  league?: {
    id: string;
    name: string;
  };
}

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          league:leagues(
            id,
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'league'>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTeams(); // Refresh the list
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating team:', err);
      return { data: null, error: err.message };
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      // Check if any rows were updated
      if (!data || data.length === 0) {
        throw new Error('Team not found or you do not have permission to update this team');
      }
      
      await fetchTeams(); // Refresh the list
      return { data: data[0], error: null };
    } catch (err: any) {
      console.error('Error updating team:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      
      // Check if any rows were deleted
      if (!data || data.length === 0) {
        throw new Error('Team not found or you do not have permission to delete this team');
      }
      
      await fetchTeams(); // Refresh the list
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting team:', err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    refetch: fetchTeams
  };
};
