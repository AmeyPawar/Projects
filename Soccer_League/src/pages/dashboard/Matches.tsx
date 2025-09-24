
import { Calendar, Clock, Play, Edit, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  team1_score: number | null;
  team2_score: number | null;
  match_date: string | null;
  status: string;
  venue: string | null;
  team1: {
    id: string;
    name: string;
    logo_url?: string;
  } | null;
  team2: {
    id: string;
    name: string;
    logo_url?: string;
  } | null;
}

const Matches = () => {
  const { currentLeague, isAdmin } = useCurrentLeague();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!currentLeague?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            team1:teams!matches_team1_id_fkey(
              id,
              name,
              logo_url
            ),
            team2:teams!matches_team2_id_fkey(
              id,
              name,
              logo_url
            )
          `)
          .eq('league_id', currentLeague.id)
          .order('match_date', { ascending: true });

        if (error) throw error;
        setMatches(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentLeague?.id]);

  const handleStartMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'ongoing' })
        .eq('id', matchId);

      if (error) throw error;
      
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, status: 'ongoing' } : match
      ));
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const handleRemoveMatch = async (matchId: string) => {
    if (window.confirm('Are you sure you want to remove this match?')) {
      try {
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('id', matchId);

        if (error) throw error;
        
        setMatches(prev => prev.filter(match => match.id !== matchId));
      } catch (error) {
        console.error('Error removing match:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Error loading matches</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Matches</h1>
          <p className="text-gray-600">
            {currentLeague?.name ? `${currentLeague.name} matches` : 'Schedule and manage tournament matches'}
          </p>
        </div>
        {isAdmin && (
          <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Match
          </Button>
        )}
      </div>

      {matches.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches scheduled</h3>
            <p className="text-gray-600 mb-4">
              {isAdmin ? 'Get started by scheduling your first match' : 'Matches will appear here once they are scheduled'}
            </p>
            {isAdmin && (
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Match
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <Card key={match.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 flex-1">
                    {/* Team 1 */}
                    <div className="flex items-center space-x-3">
                      <img
                        src={match.team1?.logo_url || "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=60&h=60&fit=crop&crop=center"}
                        alt={`${match.team1?.name} logo`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                      <span className="font-semibold text-gray-900">{match.team1?.name || 'TBD'}</span>
                    </div>

                    {/* VS and Score */}
                    <div className="text-center flex-1">
                      <div className="text-xl font-bold text-gray-500 mb-1">VS</div>
                      {match.status === 'completed' && match.team1_score !== null && match.team2_score !== null && (
                        <div className="text-2xl font-bold text-blue-600">
                          {match.team1_score} - {match.team2_score}
                        </div>
                      )}
                      {match.venue && (
                        <div className="text-sm text-gray-500">{match.venue}</div>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{match.team2?.name || 'TBD'}</span>
                      <img
                        src={match.team2?.logo_url || "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=60&h=60&fit=crop&crop=center"}
                        alt={`${match.team2?.name} logo`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="text-right ml-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(match.match_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatTime(match.match_date)}</span>
                    </div>
                    <Badge className={getStatusColor(match.status)}>
                      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Action Buttons - Only for Admin */}
                  {isAdmin && (
                    <div className="flex flex-col gap-2 ml-6">
                      {match.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleStartMatch(match.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveMatch(match.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
