import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPendingDeposits } from '../hooks/useQueries';
import GamingCard from '../components/common/GamingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import UserManagement from '../components/admin/UserManagement';
import DepositVerification from '../components/admin/DepositVerification';
import TournamentConfig from '../components/admin/TournamentConfig';
import JoinRequestsList from '../components/admin/JoinRequestsList';
import MatchManagement from '../components/admin/MatchManagement';
import DirectDeposit from '../components/admin/DirectDeposit';
import AdminPasswordGuard from '../components/admin/AdminPasswordGuard';
import { Shield, Bell } from 'lucide-react';

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: pendingDeposits } = useGetPendingDeposits();

  const isAuthenticated = !!identity;
  const pendingCount = pendingDeposits?.length || 0;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminPasswordGuard>
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Shield className="text-ff-orange" size={36} />
            <h1 className="text-4xl font-bold text-ff-orange">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage users, deposits, tournaments, and matches</p>
        </div>

        {/* Pending Deposits Notification */}
        {pendingCount > 0 && (
          <GamingCard glowColor="orange">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="text-ff-orange animate-pulse" size={28} />
                <div>
                  <h3 className="text-xl font-bold text-ff-orange">New Deposit Requests!</h3>
                  <p className="text-muted-foreground">
                    You have <strong className="text-ff-orange">{pendingCount}</strong> pending deposit{pendingCount !== 1 ? 's' : ''} waiting for verification
                  </p>
                </div>
              </div>
              <div className="bg-ff-orange text-background rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                {pendingCount}
              </div>
            </div>
          </GamingCard>
        )}

        <GamingCard glowColor="orange">
          <Tabs defaultValue="deposits" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
              <TabsTrigger value="deposits" className="relative">
                Deposits
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ff-orange text-background rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="direct-deposit">Direct Deposit</TabsTrigger>
              <TabsTrigger value="tournament">Tournament</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="join-requests">Join Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="deposits">
              <DepositVerification />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="direct-deposit">
              <DirectDeposit />
            </TabsContent>

            <TabsContent value="tournament">
              <TournamentConfig />
            </TabsContent>

            <TabsContent value="matches">
              <MatchManagement />
            </TabsContent>

            <TabsContent value="join-requests">
              <JoinRequestsList />
            </TabsContent>
          </Tabs>
        </GamingCard>
      </div>
    </AdminPasswordGuard>
  );
}
