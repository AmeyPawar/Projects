
import { useState } from 'react';
import { ArrowLeft, Upload, Plus, User, Users, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from 'react-router-dom';
import { useTeams } from '@/hooks/useTeams';
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  logo: File | null;
  logoPreview: string | null;
  captain: string;
  captainEmail: string;
}

const TeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState({
    name: '',
    captain: '',
    captainEmail: '',
    logo: null as File | null
  });
  const navigate = useNavigate();
  const { createTeam } = useTeams();
  const { currentLeague } = useCurrentLeague();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentTeam(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const addTeam = () => {
    if (currentTeam.name && currentTeam.captain) {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: currentTeam.name,
        logo: currentTeam.logo,
        logoPreview: currentTeam.logo ? URL.createObjectURL(currentTeam.logo) : null,
        captain: currentTeam.captain,
        captainEmail: currentTeam.captainEmail
      };
      
      setTeams(prev => [...prev, newTeam]);
      setCurrentTeam({ name: '', captain: '', captainEmail: '', logo: null });
      
      // Reset file input
      const fileInput = document.getElementById('team-logo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const removeTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
  };

  const handleSaveAndContinue = async () => {
    if (teams.length === 0) {
      toast({
        title: "No teams added",
        description: "Please add at least one team before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (!currentLeague?.id) {
      toast({
        title: "No league selected",
        description: "Please select a league first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save all teams to database
      for (const team of teams) {
        const teamData = {
          name: team.name,
          captain_name: team.captain,
          captain_email: team.captainEmail,
          league_id: currentLeague.id,
          logo_url: null // TODO: Handle file upload later
        };
        
        const result = await createTeam(teamData);
        if (result.error) {
          throw new Error(result.error);
        }
      }
      
      toast({
        title: "Teams saved successfully",
        description: `${teams.length} teams have been added to ${currentLeague.name}`,
      });
      
      navigate('/dashboard/teams');
    } catch (error) {
      console.error('Error saving teams:', error);
      toast({
        title: "Error saving teams",
        description: "Failed to save teams to database. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/admin-panel" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournament Setup
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Team Form */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Add New Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Team Name *</label>
                <Input
                  name="name"
                  placeholder="Enter team name"
                  value={currentTeam.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Team Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="team-logo-upload"
                  />
                  <label htmlFor="team-logo-upload" className="cursor-pointer">
                    {currentTeam.logo ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(currentTeam.logo)}
                          alt="Team logo preview"
                          className="w-16 h-16 rounded-full mx-auto object-cover"
                        />
                        <p className="text-sm text-gray-600">{currentTeam.logo.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload team logo</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Team Captain *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    name="captain"
                    placeholder="Enter captain name"
                    value={currentTeam.captain}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Captain Email</label>
                <Input
                  name="captainEmail"
                  type="email"
                  placeholder="Captain's email for login access"
                  value={currentTeam.captainEmail}
                  onChange={handleInputChange}
                />
              </div>

              <Button
                onClick={addTeam}
                disabled={!currentTeam.name || !currentTeam.captain}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </CardContent>
          </Card>

          {/* Teams List */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Teams Added ({teams.length})</span>
                {teams.length > 0 && (
                  <Button
                    onClick={handleSaveAndContinue}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save & Continue to Dashboard
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No teams added yet</p>
                  <p className="text-sm">Add your first team using the form</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {teams.map((team) => (
                    <Card key={team.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {team.logoPreview ? (
                            <img
                              src={team.logoPreview}
                              alt={`${team.name} logo`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{team.name}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Captain: {team.captain}
                              </Badge>
                              {team.captainEmail && (
                                <Badge variant="outline" className="text-xs">
                                  {team.captainEmail}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTeam(team.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
