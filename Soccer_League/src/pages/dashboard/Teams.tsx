
import { Users, User, Eye, Loader2, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { useTeams, Team } from '@/hooks/useTeams';
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Teams = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    captain_name: '',
    captain_email: ''
  });
  const { currentLeague, isAdmin } = useCurrentLeague();
  const { teams, loading, error, updateTeam, deleteTeam } = useTeams();
  const { toast } = useToast();

  // Filter teams by current league
  const currentLeagueTeams = teams.filter(team => 
    team.league_id === currentLeague?.id
  );

  const filteredTeams = currentLeagueTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captain_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditForm({
      name: team.name,
      captain_name: team.captain_name || '',
      captain_email: team.captain_email || ''
    });
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;
    
    try {
      const result = await updateTeam(editingTeam.id, editForm);
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Team updated successfully",
        description: `${editForm.name} has been updated.`,
      });
      
      setEditingTeam(null);
    } catch (error) {
      toast({
        title: "Error updating team",
        description: "Failed to update team. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      const result = await deleteTeam(teamId);
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Team deleted successfully",
        description: `${teamName} has been removed from the league.`,
      });
    } catch (error) {
      toast({
        title: "Error deleting team",
        description: "Failed to delete team. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading teams...</p>
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
                <h3 className="font-medium text-red-900">Error loading teams</h3>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
          <p className="text-gray-600">
            {currentLeague?.name ? `Teams in ${currentLeague.name}` : 'View and manage all tournament teams'}
          </p>
        </div>
        {isAdmin && (
          <Link to="/team-management">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search teams or captains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={team.logo_url || "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=80&h=80&fit=crop&crop=center"}
                  alt={`${team.name} logo`}
                  className="w-16 h-16 rounded-full object-cover border-3 border-gray-200 group-hover:border-blue-300 transition-colors"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {team.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{currentLeague?.name}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Captain Info */}
                {team.captain_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Captain:</span>
                    <span className="font-medium text-gray-900">{team.captain_name}</span>
                  </div>
                )}

                {/* Contact Info */}
                {team.captain_email && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {team.captain_email}
                  </div>
                )}

                {/* Admin Actions or View Button */}
                {isAdmin ? (
                  <div className="flex gap-2">
                    <Dialog open={editingTeam?.id === team.id} onOpenChange={(open) => !open && setEditingTeam(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="team-name">Team Name</Label>
                            <Input
                              id="team-name"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="captain-name">Captain Name</Label>
                            <Input
                              id="captain-name"
                              value={editForm.captain_name}
                              onChange={(e) => setEditForm(prev => ({...prev, captain_name: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="captain-email">Captain Email</Label>
                            <Input
                              id="captain-email"
                              type="email"
                              value={editForm.captain_email}
                              onChange={(e) => setEditForm(prev => ({...prev, captain_email: e.target.value}))}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingTeam(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateTeam}>
                              Update Team
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Team</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{team.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTeam(team.id, team.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 group-hover:shadow-lg transition-all">
                    <Eye className="h-4 w-4 mr-2" />
                    View Team Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && !loading && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600 mb-4">
              {currentLeagueTeams.length === 0 
                ? `No teams have been added to ${currentLeague?.name || 'this league'} yet.`
                : "Try adjusting your search criteria."
              }
            </p>
            {isAdmin && currentLeagueTeams.length === 0 && (
              <Link to="/team-management">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Team
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Teams;
