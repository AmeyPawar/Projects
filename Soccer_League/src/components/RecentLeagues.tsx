
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, Eye } from 'lucide-react';
import { useLeagues } from '@/hooks/useLeagues';
import LeagueAccessModal from './LeagueAccessModal';
import { Skeleton } from "@/components/ui/skeleton";

const RecentLeagues = () => {
  const { leagues, loading } = useLeagues();
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLeagueClick = (league: any) => {
    setSelectedLeague(league);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLeague(null);
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Active Leagues</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join existing leagues or create your own tournament
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-lg border-0">
              <CardHeader>
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (leagues.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Active Leagues</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            No leagues available yet. Be the first to create one!
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Active Leagues</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join existing leagues and compete with teams around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leagues.slice(0, 6).map((league) => (
            <Card key={league.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  {league.logo_url ? (
                    <img
                      src={league.logo_url}
                      alt={`${league.name} logo`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Trophy className="h-8 w-8 text-white" />
                  )}
                </div>
                <CardTitle className="text-xl text-gray-900">{league.name}</CardTitle>
                {league.description && (
                  <p className="text-gray-600 text-sm">{league.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Status: {league.status}</span>
                  </div>
                  {league.start_date && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{new Date(league.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleLeagueClick(league)}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Access League
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <LeagueAccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        league={selectedLeague}
      />
    </>
  );
};

export default RecentLeagues;
