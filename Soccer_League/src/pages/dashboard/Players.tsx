
import { User, Trophy, Target, Loader2, AlertCircle, Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { usePlayers, Player } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Players = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const { currentLeague } = useCurrentLeague();
  const { players, loading, error, createPlayer, updatePlayer, deletePlayer } = usePlayers();
  const { teams } = useTeams();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    jersey_number: '',
    team_id: '',
    photo_url: '',
    goals: 0,
    assists: 0,
    matches_played: 0
  });

  // Filter teams and players by current league
  const currentLeagueTeams = teams.filter(team => 
    team.league_id === currentLeague?.id
  );

  const currentLeaguePlayers = players.filter(player => {
    const playerTeam = teams.find(team => team.id === player.team_id);
    return playerTeam?.league_id === currentLeague?.id;
  });

  const filteredPlayers = currentLeaguePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = filterTeam === 'all' || player.team_id === filterTeam;
    return matchesSearch && matchesTeam;
  });

  const getPositionColor = (position: string | undefined) => {
    if (!position) return 'bg-gray-100 text-gray-800';
    
    switch (position.toLowerCase()) {
      case 'forward': return 'bg-red-100 text-red-800';
      case 'midfielder': return 'bg-green-100 text-green-800';
      case 'defender': return 'bg-blue-100 text-blue-800';
      case 'goalkeeper': return 'bg-purple-100 text-purple-800';
      case 'winger': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      jersey_number: '',
      team_id: '',
      photo_url: '',
      goals: 0,
      assists: 0,
      matches_played: 0
    });
    setEditingPlayer(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (player: Player) => {
    setFormData({
      name: player.name,
      position: player.position || '',
      jersey_number: player.jersey_number?.toString() || '',
      team_id: player.team_id || '',
      photo_url: player.photo_url || '',
      goals: player.goals || 0,
      assists: player.assists || 0,
      matches_played: player.matches_played || 0
    });
    setEditingPlayer(player);
    setIsDialogOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36)}.${fileExt}`;
      const filePath = `players/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('league-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('league-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      toast({
        title: "Photo uploaded",
        description: "Player photo has been uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a player name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.team_id) {
      toast({
        title: "Team required",
        description: "Please select a team for the player",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const playerData = {
        name: formData.name.trim(),
        position: formData.position || null,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        team_id: formData.team_id,
        photo_url: formData.photo_url || null,
        goals: formData.goals,
        assists: formData.assists,
        matches_played: formData.matches_played
      };

      if (editingPlayer) {
        const { error } = await updatePlayer(editingPlayer.id, playerData);
        if (error) throw new Error(error);
        
        toast({
          title: "Player updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        const { error } = await createPlayer(playerData);
        if (error) throw new Error(error);
        
        toast({
          title: "Player added",
          description: `${formData.name} has been added to the team`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: editingPlayer ? "Update failed" : "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (player: Player) => {
    if (!confirm(`Are you sure you want to delete ${player.name}?`)) return;

    try {
      const { error } = await deletePlayer(player.id);
      if (error) throw new Error(error);
      
      toast({
        title: "Player deleted",
        description: `${player.name} has been removed from the team`,
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading players...</p>
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
                <h3 className="font-medium text-red-900">Error loading players</h3>
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Players</h1>
          <p className="text-gray-600">
            {currentLeague?.name ? `Players in ${currentLeague.name}` : 'View and manage all tournament players'}
          </p>
        </div>
        {isAdmin && currentLeagueTeams.length > 0 && (
          <Button onClick={openAddDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search players, teams, or positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {currentLeagueTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative">
            {isAdmin && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(player)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(player)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center">
                {/* Player Photo with Jersey Number */}
                <div className="relative mb-4">
                  <img
                    src={player.photo_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=center"}
                    alt={player.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-gray-200 group-hover:border-blue-300 transition-colors"
                  />
                  {player.jersey_number && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {player.jersey_number}
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {player.name}
                </h3>
                
                {player.position && (
                  <Badge className={`mb-3 ${getPositionColor(player.position)}`}>
                    {player.position}
                  </Badge>
                )}

                {player.team && (
                  <p className="text-sm text-gray-600 mb-4 font-medium">{player.team.name}</p>
                )}

                {/* Player Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Target className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{player.goals || 0}</p>
                    <p className="text-xs text-gray-600">Goals</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{player.assists || 0}</p>
                    <p className="text-xs text-gray-600">Assists</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">{player.matches_played || 0}</p>
                    <p className="text-xs text-gray-600">Matches</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Player Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
            <DialogDescription>
              {editingPlayer ? 'Update player information and stats' : 'Add a new player to the team'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Player Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter player name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jersey_number">Jersey Number</Label>
                <Input
                  id="jersey_number"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.jersey_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, jersey_number: e.target.value }))}
                  placeholder="Jersey #"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team_id">Team *</Label>
                <Select value={formData.team_id} onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentLeagueTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                    <SelectItem value="Defender">Defender</SelectItem>
                    <SelectItem value="Midfielder">Midfielder</SelectItem>
                    <SelectItem value="Forward">Forward</SelectItem>
                    <SelectItem value="Winger">Winger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Player Photo</Label>
              <div className="flex items-center gap-4">
                {formData.photo_url ? (
                  <div className="relative">
                    <img 
                      src={formData.photo_url} 
                      alt="Player photo" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhoto}
                    className="w-full"
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Goals</Label>
                <Input
                  id="goals"
                  type="number"
                  min="0"
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assists">Assists</Label>
                <Input
                  id="assists"
                  type="number"
                  min="0"
                  value={formData.assists}
                  onChange={(e) => setFormData(prev => ({ ...prev, assists: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="matches_played">Matches</Label>
                <Input
                  id="matches_played"
                  type="number"
                  min="0"
                  value={formData.matches_played}
                  onChange={(e) => setFormData(prev => ({ ...prev, matches_played: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingPlayer ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingPlayer ? 'Update Player' : 'Add Player'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {filteredPlayers.length === 0 && !loading && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
            <p className="text-gray-600">
              {currentLeaguePlayers.length === 0 
                ? `No players have been added to teams in ${currentLeague?.name || 'this league'} yet.`
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Players;
