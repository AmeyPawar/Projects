
import { Trophy, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface PointsTableEntry {
  id: string;
  team_id: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

const PointsTable = () => {
  const { currentLeague } = useCurrentLeague();
  const [pointsData, setPointsData] = useState<PointsTableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPointsTable = async () => {
      if (!currentLeague?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('points_table')
          .select(`
            *,
            team:teams(
              id,
              name,
              logo_url
            )
          `)
          .eq('league_id', currentLeague.id)
          .order('points', { ascending: false })
          .order('goal_difference', { ascending: false });

        if (error) throw error;
        setPointsData(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching points table:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsTable();
  }, [currentLeague?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Points Table</h1>
          <p className="text-gray-600">Current tournament standings</p>
        </div>
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              League Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading points table: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Points Table</h1>
        <p className="text-gray-600">
          {currentLeague?.name ? `${currentLeague.name} standings` : 'Current tournament standings'}
        </p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            League Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pointsData.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No standings yet</h3>
              <p className="text-gray-600">Points will appear here after matches are played</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">MP</TableHead>
                    <TableHead className="text-center">W</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">L</TableHead>
                    <TableHead className="text-center">GF</TableHead>
                    <TableHead className="text-center">GA</TableHead>
                    <TableHead className="text-center">GD</TableHead>
                    <TableHead className="text-center font-semibold">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsData.map((entry, index) => (
                    <TableRow key={entry.id} className={index < 3 ? "bg-green-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {index === 0 && <Medal className="h-4 w-4 text-yellow-500" />}
                          {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                          {index === 2 && <Medal className="h-4 w-4 text-orange-600" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.team?.logo_url || "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=40&h=40&fit=crop&crop=center"}
                            alt={`${entry.team?.name} logo`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium">{entry.team?.name}</span>
                          {index < 3 && (
                            <Badge variant="outline" className="text-xs">
                              Top 3
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{entry.matches_played}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">{entry.wins}</TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">{entry.draws}</TableCell>
                      <TableCell className="text-center text-red-600 font-medium">{entry.losses}</TableCell>
                      <TableCell className="text-center">{entry.goals_for}</TableCell>
                      <TableCell className="text-center">{entry.goals_against}</TableCell>
                      <TableCell className="text-center">{entry.goal_difference}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-800 font-bold">
                          {entry.points}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsTable;
