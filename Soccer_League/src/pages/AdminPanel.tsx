
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Users, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [numTeams, setNumTeams] = useState<number>(4);
  const navigate = useNavigate();

  useEffect(() => {
    // Get tournament data from previous step
    const storedData = sessionStorage.getItem('tournamentData');
    if (storedData) {
      setTournamentData(JSON.parse(storedData));
    }
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceed = () => {
    // Store additional tournament setup data
    const completeData = {
      ...tournamentData,
      logo: logo,
      logoPreview: logoPreview,
      numTeams: numTeams
    };
    
    sessionStorage.setItem('completeData', JSON.stringify(completeData));
    console.log('Complete tournament setup:', completeData);
    
    // Navigate to team management
    navigate('/team-management');
  };

  if (!tournamentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Tournament Data Found</h2>
            <p className="text-gray-600 mb-6">Please create a tournament first.</p>
            <Link to="/create-league">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Create Tournament
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Link to="/create-league" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournament Setup
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tournament Information Display */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Tournament Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{tournamentData.leagueName}</h3>
                <Badge className="bg-green-100 text-green-800 mt-1">In Setup</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(tournamentData.startDate).toLocaleDateString()} - {new Date(tournamentData.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {tournamentData.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{tournamentData.description}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Admin Contact</h4>
                <p className="text-sm text-gray-600">{tournamentData.email}</p>
                <p className="text-sm text-gray-600">{tournamentData.phone}</p>
              </div>

              {tournamentData.rules && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Rules</h4>
                  <p className="text-xs text-gray-600">{tournamentData.rules}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tournament Setup Form */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Complete Tournament Setup</CardTitle>
              <p className="text-gray-600">Add logo and configure teams</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Tournament Logo</label>
                <div className="flex items-center space-x-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Tournament logo" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{tournamentData.leagueName.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </label>
                  </div>
                </div>
              </div>

              {/* Number of Teams */}
              <div className="space-y-2">
                <label htmlFor="numTeams" className="text-sm font-medium text-gray-700">Number of Teams</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="numTeams"
                    type="number"
                    min="2"
                    max="32"
                    value={numTeams}
                    onChange={(e) => setNumTeams(parseInt(e.target.value))}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Choose between 2-32 teams</p>
              </div>

              <Button 
                onClick={handleProceed}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-3"
              >
                Proceed to Team Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
