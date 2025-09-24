
import { Trophy, Users, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeagues } from '@/hooks/useLeagues';
import { useTeams } from '@/hooks/useTeams';
import { usePlayers } from '@/hooks/usePlayers';
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const DashboardHome = () => {
  const { leagues, loading: leaguesLoading } = useLeagues();
  const { teams, loading: teamsLoading } = useTeams();
  const { players, loading: playersLoading } = usePlayers();
  const { updateCurrentLeague } = useCurrentLeague();
  const { user } = useAuth();
  const navigate = useNavigate();

  const loading = leaguesLoading || teamsLoading || playersLoading;

  const handleLeagueClick = async (league: any) => {
    if (!user) return;

    try {
      // Check if current user is admin or league creator
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .or(`user_id.eq.${user.id},and(user_id.is.null,email.eq.${user.email})`)
        .single();

      const isGlobalAdmin = !!adminData;
      const isLeagueCreator = league.created_by === user.id;

      // Set current league context with proper role determination
      updateCurrentLeague({
        id: league.id,
        name: league.name,
        logo_url: league.logo_url,
        userRole: (isGlobalAdmin || isLeagueCreator) ? 'admin' : 'viewer',
        userEmail: user.email || '',
        isGlobalAdmin,
        isLeagueCreator,
        createdBy: league.created_by
      });
      navigate('/dashboard/teams');
    } catch (error) {
      console.error('Error checking user role:', error);
      // Fallback to viewer mode
      updateCurrentLeague({
        id: league.id,
        name: league.name,
        logo_url: league.logo_url,
        userRole: 'viewer',
        userEmail: user.email || '',
        isGlobalAdmin: false,
        isLeagueCreator: false,
        createdBy: league.created_by
      });
      navigate('/dashboard/teams');
    }
  };

  // Calculate stats
  const totalLeagues = leagues.length;
  const totalTeams = teams.length;
  const totalPlayers = players.length;
  const totalGoals = players.reduce((sum, player) => sum + (player.goals || 0), 0);

  const stats = [
    {
      title: "Active Leagues",
      value: totalLeagues,
      icon: Trophy,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Teams",
      value: totalTeams,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Registered Players",
      value: totalPlayers,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Total Goals",
      value: totalGoals,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your football league management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leagues */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Recent Leagues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leagues.length > 0 ? (
              <div className="space-y-3">
                {leagues.slice(0, 5).map((league) => (
                  <div 
                    key={league.id} 
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleLeagueClick(league)}
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{league.name}</h4>
                      <p className="text-sm text-gray-600">Status: {league.status}</p>
                      {league.start_date && (
                        <p className="text-xs text-gray-500">
                          Starts: {new Date(league.start_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No leagues created yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Teams */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Recent Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length > 0 ? (
              <div className="space-y-3">
                {teams.slice(0, 5).map((team) => (
                  <div key={team.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={team.logo_url || "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=40&h=40&fit=crop&crop=center"}
                      alt={`${team.name} logo`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{team.name}</h4>
                      {team.captain_name && (
                        <p className="text-sm text-gray-600">Captain: {team.captain_name}</p>
                      )}
                      {team.league && (
                        <p className="text-xs text-gray-500">League: {team.league.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No teams created yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
