import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPendingDeposits } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import GamingCard from '../components/common/GamingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import UserManagement from '../components/admin/UserManagement';
import DepositVerification from '../components/admin/DepositVerification';
import TournamentConfig from '../components/admin/TournamentConfig';
import JoinRequestsList from '../components/admin/JoinRequestsList';
import MatchManagement from '../components/admin/MatchManagement';
import DirectDeposit from '../components/admin/DirectDeposit';
import AdminPasswordGuard from '../components/admin/AdminPasswordGuard';
import AccessDeniedScreen from '../components/admin/AccessDeniedScreen';
import { Shield, Bell, AlertCircle, RefreshCw } from 'lucide-react';
import GamingButton from '../components/common/GamingButton';

const SESSION_KEY = 'tnff_admin_role';

export default function AdminPanel() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { actor, isFetching: actorLoading } = useActor();
  const { data: pendingDeposits } = useGetPendingDeposits();
  const [isValidatingRole, setIsValidatingRole] = useState(true);
  const [roleValid, setRoleValid] = useState(false);

  const isAuthenticated = !!identity;
  const pendingCount = pendingDeposits?.length || 0;

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] AdminPanel - Authentication check:`, { isAuthenticated });
    
    if (!isAuthenticated) {
      console.log(`[${timestamp}] AdminPanel - Redirecting to login`);
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  // Validate admin role with backend on mount
  useEffect(() => {
    const validateAdminRole = async () => {
      const timestamp = new Date().toISOString();
      
      if (!actor || actorLoading) {
        console.log(`[${timestamp}] AdminPanel - Waiting for actor initialization`);
        return;
      }

      const sessionRole = sessionStorage.getItem(SESSION_KEY);
      console.log(`[${timestamp}] AdminPanel - Validating admin role. Session role:`, sessionRole);

      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log(`[${timestamp}] AdminPanel - Backend validation result:`, { isAdmin });

        if (isAdmin) {
          // Ensure session storage is in sync
          if (sessionRole !== 'admin') {
            console.log(`[${timestamp}] AdminPanel - Syncing session storage with backend role`);
            sessionStorage.setItem(SESSION_KEY, 'admin');
          }
          setRoleValid(true);
        } else {
          // Backend says not admin, clear stale session
          console.warn(`[${timestamp}] AdminPanel - Backend validation failed, clearing stale session`);
          if (sessionRole) {
            sessionStorage.removeItem(SESSION_KEY);
          }
          setRoleValid(false);
        }
      } catch (error: any) {
        console.error(`[${timestamp}] AdminPanel - Role validation error:`, error);
        setRoleValid(false);
      } finally {
        setIsValidatingRole(false);
      }
    };

    if (isAuthenticated && actor && !actorLoading) {
      validateAdminRole();
    }
  }, [actor, actorLoading, isAuthenticated]);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] AdminPanel - Actor state:`, {
      actorAvailable: !!actor,
      actorLoading,
    });
  }, [actor, actorLoading]);

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

  // Show access denied if role validation completed and role is invalid
  if (!isValidatingRole && !roleValid && !actorLoading) {
    return <AccessDeniedScreen />;
  }

  return (
    <AdminPasswordGuard>
      {(actorLoading || isValidatingRole) && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-orange mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isValidatingRole ? 'Validating admin access...' : 'Connecting to admin services...'}
            </p>
          </div>
        </div>
      )}

      {!actorLoading && !isValidatingRole && !actor && (
        <GamingCard glowColor="orange">
          <div className="text-center space-y-6 py-8">
            <AlertCircle className="text-destructive mx-auto" size={64} />
            <div>
              <h2 className="text-2xl font-bold text-destructive mb-2">Connection Error</h2>
              <p className="text-muted-foreground mb-4">
                Admin tools are temporarily unavailable. Please refresh the page.
              </p>
            </div>
            <GamingButton onClick={() => window.location.reload()}>
              <RefreshCw size={18} className="mr-2" />
              Refresh Page
            </GamingButton>
          </div>
        </GamingCard>
      )}

      {!actorLoading && !isValidatingRole && actor && roleValid && (
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
      )}
    </AdminPasswordGuard>
  );
}
