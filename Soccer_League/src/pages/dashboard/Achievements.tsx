
import { Trophy, Target, Medal, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlayerAchievement {
  player_id: string;
  player_name: string;
  team_name: string;
  goals: number;
  assists: number;
  matches_played: number;
}

const Achievements = () => {
  const { currentLeague } = useCurrentLeague();
  const [topScorer, setTopScorer] = useState<PlayerAchievement | null>(null);
  const [topAssister, setTopAssister] = useState<PlayerAchievement | null>(null);
  const [mostActive, setMostActive] = useState<PlayerAchievement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!currentLeague?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get players from teams in current league with their stats
        const { data: playersData, error } = await supabase
          .from('players')
          .select(`
            id,
            name,
            goals,
            assists,
            matches_played,
            team:teams!inner(
              name,
              league_id
            )
          `)
          .eq('team.league_id', currentLeague.id);

        if (error) throw error;

        const players = playersData?.map(player => ({
          player_id: player.id,
          player_name: player.name,
          team_name: player.team?.name || 'Unknown Team',
          goals: player.goals || 0,
          assists: player.assists || 0,
          matches_played: player.matches_played || 0
        })) || [];

        // Find top achievements
        if (players.length > 0) {
          const topGoalScorer = players.reduce((prev, current) => 
            (current.goals > prev.goals) ? current : prev
          );
          
          const topAssistProvider = players.reduce((prev, current) => 
            (current.assists > prev.assists) ? current : prev
          );
          
          const mostActivePlayer = players.reduce((prev, current) => 
            (current.matches_played > prev.matches_played) ? current : prev
          );

          setTopScorer(topGoalScorer.goals > 0 ? topGoalScorer : null);
          setTopAssister(topAssistProvider.assists > 0 ? topAssistProvider : null);
          setMostActive(mostActivePlayer.matches_played > 0 ? mostActivePlayer : null);
        }
      } catch (err: any) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [currentLeague?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  const achievements = [
    ...(topScorer ? [{
      id: 1,
      title: "Top Scorer",
      player: topScorer.player_name,
      team: topScorer.team_name,
      value: `${topScorer.goals} Goals`,
      icon: Target,
      color: "text-red-600 bg-red-100"
    }] : []),
    ...(topAssister ? [{
      id: 2,
      title: "Most Assists",
      player: topAssister.player_name,
      team: topAssister.team_name,
      value: `${topAssister.assists} Assists`,
      icon: Star,
      color: "text-yellow-600 bg-yellow-100"
    }] : []),
    ...(mostActive ? [{
      id: 3,
      title: "Most Active Player",
      player: mostActive.player_name,
      team: mostActive.team_name,
      value: `${mostActive.matches_played} Matches`,
      icon: Trophy,
      color: "text-green-600 bg-green-100"
    }] : [])
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">
          {currentLeague?.name ? `Outstanding performances in ${currentLeague.name}` : 'Outstanding performances and records'}
        </p>
      </div>

      {achievements.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
            <p className="text-gray-600">
              Achievements will appear here once players start recording stats in matches
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Individual Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${achievement.color} mb-4`}>
                    <achievement.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="font-semibold text-lg text-blue-600 mb-1">{achievement.player}</p>
                  <Badge variant="outline" className="mb-2">{achievement.team}</Badge>
                  <p className="text-2xl font-bold text-gray-900">{achievement.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Achievements */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topScorer && (
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="bg-yellow-500 p-2 rounded-full">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Top Scorer Achievement!</p>
                      <p className="text-gray-600">
                        {topScorer.player_name} from {topScorer.team_name} leads with {topScorer.goals} goals
                      </p>
                    </div>
                    <Badge className="ml-auto">Current</Badge>
                  </div>
                )}
                
                {topAssister && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 p-2 rounded-full">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Most Assists Achievement!</p>
                      <p className="text-gray-600">
                        {topAssister.player_name} from {topAssister.team_name} leads with {topAssister.assists} assists
                      </p>
                    </div>
                    <Badge variant="outline">Current</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Achievements;
