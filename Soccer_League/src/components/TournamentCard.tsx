
import { Calendar, Users, Eye, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    logo: string;
    status: string;
    teams: number;
    startDate: string;
    endDate: string;
  };
}

const TournamentCard = ({ tournament }: TournamentCardProps) => {
  const statusColor = tournament.status === 'Ongoing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-gray-200 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={tournament.logo}
                alt={`${tournament.name} logo`}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300"
              />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                <Trophy className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {tournament.name}
              </h3>
              <Badge className={`${statusColor} text-xs font-medium`}>
                {tournament.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-blue-500" />
            <span>{tournament.teams} Teams</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium transition-all duration-300"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Tournament
          </Button>
        </div>

        {/* Progress indicator for ongoing tournaments */}
        {tournament.status === 'Ongoing' && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Tournament Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full w-3/5"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TournamentCard;
