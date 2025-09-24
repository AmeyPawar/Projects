
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LeagueAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: {
    id: string;
    name: string;
    logo_url?: string;
  } | null;
}

const LeagueAccessModal: React.FC<LeagueAccessModalProps> = ({ isOpen, onClose, league }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!league) return;
    
    setLoading(true);
    setError('');

    try {
      // Check if the email belongs to a global admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }

      // Check if the email is the league creator
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('created_by')
        .eq('id', league.id)
        .single();

      if (leagueError) {
        throw leagueError;
      }

      // Check if current authenticated user is the league creator
      let isLeagueCreator = false;
      if (user) {
        isLeagueCreator = leagueData.created_by === user.id;
      }

      // Determine role: admin if global admin OR league creator, otherwise viewer
      const isAdmin = adminData || isLeagueCreator;

      // Store league access info in session
      sessionStorage.setItem('currentLeague', JSON.stringify({
        ...league,
        userRole: isAdmin ? 'admin' : 'viewer',
        userEmail: email,
        isGlobalAdmin: !!adminData,
        isLeagueCreator: isLeagueCreator,
        createdBy: leagueData.created_by
      }));

      if (isAdmin) {
        // Admin access - redirect to dashboard (they can access admin features from there)
        navigate('/dashboard');
      } else {
        // Viewer access - redirect to dashboard
        navigate('/dashboard');
      }
      
      onClose();
    } catch (err: any) {
      setError('Error checking access. Please try again.');
      console.error('Access error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Access League: {league?.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAccess} className="space-y-4">
          <div className="text-center mb-4">
            {league?.logo_url && (
              <img
                src={league.logo_url}
                alt={`${league.name} logo`}
                className="w-16 h-16 mx-auto rounded-full object-cover mb-2"
              />
            )}
            <p className="text-gray-600">Enter your email to access this league</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="access-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {loading ? 'Checking...' : 'Access League'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueAccessModal;
