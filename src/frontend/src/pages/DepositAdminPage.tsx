import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import DepositPasswordGuard from '../components/admin/DepositPasswordGuard';
import DirectDeposit from '../components/admin/DirectDeposit';
import UserManagement from '../components/admin/UserManagement';
import AccessDeniedScreen from '../components/admin/AccessDeniedScreen';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Coins, Users } from 'lucide-react';

export default function DepositAdminPage() {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-cyan mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <DepositPasswordGuard>
      <div className="min-h-screen bg-gaming-texture">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ff-cyan mb-2 flex items-center">
              <Coins className="mr-3" size={36} />
              Coin Deposit Management Portal
            </h1>
            <p className="text-muted-foreground">Directly add coins to user wallets and view transaction history</p>
          </div>

          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="deposit" className="flex items-center gap-2">
                <Coins size={18} />
                Direct Deposit
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users size={18} />
                User Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit">
              <DirectDeposit />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DepositPasswordGuard>
  );
}
