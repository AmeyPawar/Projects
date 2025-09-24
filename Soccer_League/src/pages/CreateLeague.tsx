import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Users, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { useLeagues } from '@/hooks/useLeagues';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const CreateLeague = () => {
  const [formData, setFormData] = useState({
    leagueName: '',
    description: '',
    startDate: '',
    endDate: '',
    rules: '',
    email: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { createLeague } = useLeagues();
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a league');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, ensure user is added as admin
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert([
          {
            user_id: user.id,
            email: user.email || formData.email,
            role: 'admin'
          }
        ]);

      if (adminError) {
        console.log('Admin role assignment note:', adminError.message);
      }

      const leagueData = {
        name: formData.leagueName,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        rules: formData.rules,
        status: 'setup'
      };

      const { data, error } = await createLeague(leagueData);
      
      if (error) {
        setError(error);
        return;
      }

      // Store additional data in session storage for the admin panel
      const completeData = {
        ...formData,
        leagueId: data?.id
      };
      sessionStorage.setItem('tournamentData', JSON.stringify(completeData));
      
      // Set current league context with admin access
      sessionStorage.setItem('currentLeague', JSON.stringify({
        id: data?.id,
        name: formData.leagueName,
        logo_url: null,
        userRole: 'admin',
        userEmail: user.email || formData.email
      }));
      
      navigate('/admin-panel');
    } catch (err: any) {
      setError(err.message || 'Failed to create league');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to create a league.</p>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Sign In
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
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Trophy className="h-5 w-5 text-blue-600" />
                Create New League
              </CardTitle>
              <p className="text-gray-600">Set up your tournament details</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="leagueName">League Name *</Label>
                  <Input
                    id="leagueName"
                    name="leagueName"
                    placeholder="Enter league name"
                    value={formData.leagueName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the league"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">League Rules</Label>
                  <Textarea
                    id="rules"
                    name="rules"
                    placeholder="Tournament rules and regulations"
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Admin contact email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Admin contact phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-3"
                  disabled={loading}
                >
                  {loading ? 'Creating League...' : 'Create League & Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Side - Features */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">League Setup</h3>
                    <p className="text-sm text-gray-600">Add tournament logo and configure basic settings</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Team Management</h3>
                    <p className="text-sm text-gray-600">Add teams with logos and captain details</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Go Live</h3>
                    <p className="text-sm text-gray-600">Start managing matches and view live standings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="h-6 w-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Features Included</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>Match scheduling and management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Team and player management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span>Live points table updates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLeague;
