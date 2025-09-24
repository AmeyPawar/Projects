
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Player {
  id: string;
  name: string;
  jersey_number?: number;
  position?: string;
  team_id?: string;
  photo_url?: string;
  goals?: number;
  assists?: number;
  matches_played?: number;
  team?: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          team:teams(
            id,
            name,
            logo_url
          )
        `)
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async (playerData: Omit<Player, 'id' | 'team'>) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchPlayers(); // Refresh the list
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating player:', err);
      return { data: null, error: err.message };
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchPlayers(); // Refresh the list
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating player:', err);
      return { data: null, error: err.message };
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPlayers(); // Refresh the list
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting player:', err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return {
    players,
    loading,
    error,
    createPlayer,
    updatePlayer,
    deletePlayer,
    refetch: fetchPlayers
  };
};
