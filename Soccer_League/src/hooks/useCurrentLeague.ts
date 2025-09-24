
import { useState, useEffect } from 'react';

interface CurrentLeague {
  id: string;
  name: string;
  logo_url?: string;
  userRole: 'admin' | 'viewer';
  userEmail: string;
  isGlobalAdmin: boolean;
  isLeagueCreator: boolean;
  createdBy: string | null;
}

export const useCurrentLeague = () => {
  const [currentLeague, setCurrentLeague] = useState<CurrentLeague | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('currentLeague');
    if (stored) {
      try {
        setCurrentLeague(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored league data:', error);
        sessionStorage.removeItem('currentLeague');
      }
    }
  }, []);

  const clearCurrentLeague = () => {
    sessionStorage.removeItem('currentLeague');
    setCurrentLeague(null);
  };

  const updateCurrentLeague = (league: CurrentLeague) => {
    sessionStorage.setItem('currentLeague', JSON.stringify(league));
    setCurrentLeague(league);
  };

  return {
    currentLeague,
    clearCurrentLeague,
    updateCurrentLeague,
    isAdmin: currentLeague?.userRole === 'admin',
    isViewer: currentLeague?.userRole === 'viewer',
    isGlobalAdmin: currentLeague?.isGlobalAdmin || false,
    isLeagueCreator: currentLeague?.isLeagueCreator || false
  };
};
