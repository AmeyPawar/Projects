
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Trophy, 
  Calendar, 
  Medal, 
  Users, 
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useCurrentLeague } from '@/hooks/useCurrentLeague';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DashboardSidebar = () => {
  const location = useLocation();
  const { isAdmin: isGlobalAdminFromDB, loading } = useAdminRole();
  const { currentLeague, clearCurrentLeague, isAdmin, isGlobalAdmin, isLeagueCreator } = useCurrentLeague();
  const navigate = useNavigate();
  
  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Points Table', href: '/dashboard/points-table', icon: Trophy },
    { name: 'Matches', href: '/dashboard/matches', icon: Calendar },
    { name: 'Achievements', href: '/dashboard/achievements', icon: Medal },
    { name: 'Teams', href: '/dashboard/teams', icon: Users },
    { name: 'Players', href: '/dashboard/players', icon: User },
  ];

  // Add admin navigation items if user is admin (either global admin or league creator)
  if ((isGlobalAdminFromDB || isAdmin || isGlobalAdmin || isLeagueCreator) && !loading) {
    navigation.push({ name: 'Admin Panel', href: '/admin-panel', icon: Settings });
  }

  const handleExitLeague = () => {
    clearCurrentLeague();
    navigate('/');
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
          {currentLeague?.logo_url ? (
            <img
              src={currentLeague.logo_url}
              alt={`${currentLeague.name} logo`}
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <Trophy className="h-6 w-6 text-white" />
          )}
        </div>
        <div className="flex-1">
          <span className="text-lg font-bold text-gray-900">
            {currentLeague?.name || 'TournamentPro'}
          </span>
          {currentLeague && (
            <p className="text-xs text-gray-600">
              {(isGlobalAdminFromDB || isAdmin || isGlobalAdmin || isLeagueCreator) ? 'Admin Access' : 'Viewer Mode'}
            </p>
          )}
        </div>
      </div>
      
      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {currentLeague && (
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExitLeague}
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Exit League
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
