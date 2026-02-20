import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import TournamentPasswordGuard from '../components/admin/TournamentPasswordGuard';
import MatchManagement from '../components/admin/MatchManagement';
import JoinRequestsList from '../components/admin/JoinRequestsList';
import TournamentConfig from '../components/admin/TournamentConfig';
import AccessDeniedScreen from '../components/admin/AccessDeniedScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Users, Settings } from 'lucide-react';

export default function TournamentAdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  useEffect(() => {
    if (!identity && !profileLoading) {
      navigate({ to: '/login' });
    }
  }, [identity, profileLoading, navigate]);

  if (!identity || profileLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <TournamentPasswordGuard>
      <div className="min-h-screen bg-gaming-texture">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ff-orange mb-2 flex items-center">
              <Trophy className="mr-3" size={36} />
              Tournament Management Portal
            </h1>
            <p className="text-muted-foreground">Manage tournament matches, join requests, and configuration</p>
          </div>

          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Trophy size={18} />
                Matches
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Users size={18} />
                Join Requests
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings size={18} />
                Configuration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
              <MatchManagement />
            </TabsContent>

            <TabsContent value="requests">
              <JoinRequestsList />
            </TabsContent>

            <TabsContent value="config">
              <TournamentConfig />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TournamentPasswordGuard>
  );
}
