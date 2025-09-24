
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CreateLeague from "./pages/CreateLeague";
import AdminPanel from "./pages/AdminPanel";
import TeamManagement from "./pages/TeamManagement";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Players from "./pages/dashboard/Players";
import Teams from "./pages/dashboard/Teams";
import Matches from "./pages/dashboard/Matches";
import PointsTable from "./pages/dashboard/PointsTable";
import Achievements from "./pages/dashboard/Achievements";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create-league" element={
              <ProtectedRoute>
                <CreateLeague />
              </ProtectedRoute>
            } />
            <Route path="/admin-panel" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/team-management" element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="players" element={<Players />} />
              <Route path="teams" element={<Teams />} />
              <Route path="matches" element={<Matches />} />
              <Route path="points-table" element={<PointsTable />} />
              <Route path="achievements" element={<Achievements />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
