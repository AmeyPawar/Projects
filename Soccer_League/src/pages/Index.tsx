
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart3, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import RecentLeagues from "@/components/RecentLeagues";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">League Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button onClick={signOut} variant="outline">Sign Out</Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Football League
            <span className="block text-blue-600">Like a Pro</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create and manage dynamic football tournaments with real-time match tracking, 
            automated points calculation, and comprehensive team management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create-league">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3">
                Create League
              </Button>
            </Link>
            {user && (
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  View Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Recent Leagues Section */}
      <RecentLeagues />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools to manage every aspect of your football league, 
            from team registration to live match updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Add teams, manage player rosters, and track team statistics with ease.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Match Scheduling</CardTitle>
              <CardDescription>
                Schedule matches, set venues, and manage match results in real-time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Live Points Table</CardTitle>
              <CardDescription>
                Automatic points calculation with live standings and match statistics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                Role-based access control with secure admin and user authentication.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Live match updates and instant points table recalculation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Multiple Leagues</CardTitle>
              <CardDescription>
                Manage multiple tournaments simultaneously with separate standings.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Create your first league today and experience the power of professional 
            tournament management at your fingertips.
          </p>
          {user ? (
            <Link to="/create-league">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                Create Your League
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">League Manager</span>
          </div>
          <p className="text-gray-400">
            Professional football league management made simple.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
