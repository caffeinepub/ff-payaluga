import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import GamingCard from '../components/common/GamingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import UserManagement from '../components/admin/UserManagement';
import DepositVerification from '../components/admin/DepositVerification';
import TournamentConfig from '../components/admin/TournamentConfig';
import JoinRequestsList from '../components/admin/JoinRequestsList';
import AccessDeniedScreen from '../components/admin/AccessDeniedScreen';
import { Shield } from 'lucide-react';

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Shield className="text-ff-orange" size={36} />
          <h1 className="text-4xl font-bold text-ff-orange">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">Manage users, deposits, and tournaments</p>
      </div>

      <GamingCard glowColor="orange">
        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
            <TabsTrigger value="joins">Join Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="deposits">
            <DepositVerification />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="tournament">
            <TournamentConfig />
          </TabsContent>

          <TabsContent value="joins">
            <JoinRequestsList />
          </TabsContent>
        </Tabs>
      </GamingCard>
    </div>
  );
}
