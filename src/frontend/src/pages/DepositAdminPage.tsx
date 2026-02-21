import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import DepositPasswordGuard from '../components/admin/DepositPasswordGuard';
import AccessDeniedScreen from '../components/admin/AccessDeniedScreen';
import DirectDeposit from '../components/admin/DirectDeposit';
import UserManagement from '../components/admin/UserManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Coins, Users } from 'lucide-react';

const SESSION_KEY = 'tnff_admin_role';

export default function DepositAdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorLoading } = useActor();
  const [isValidatingRole, setIsValidatingRole] = useState(true);
  const [roleValid, setRoleValid] = useState(false);

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/login' });
    }
  }, [identity, navigate]);

  // Validate admin role with backend on mount
  useEffect(() => {
    const validateAdminRole = async () => {
      const timestamp = new Date().toISOString();
      
      if (!actor || actorLoading) {
        console.log(`[${timestamp}] DepositAdminPage - Waiting for actor initialization`);
        return;
      }

      const sessionRole = sessionStorage.getItem(SESSION_KEY);
      console.log(`[${timestamp}] DepositAdminPage - Validating admin role. Session role:`, sessionRole);

      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log(`[${timestamp}] DepositAdminPage - Backend validation result:`, { isAdmin });

        if (isAdmin) {
          // Ensure session storage is in sync
          if (sessionRole !== 'admin') {
            console.log(`[${timestamp}] DepositAdminPage - Syncing session storage with backend role`);
            sessionStorage.setItem(SESSION_KEY, 'admin');
          }
          setRoleValid(true);
        } else {
          // Backend says not admin, clear stale session
          console.warn(`[${timestamp}] DepositAdminPage - Backend validation failed, clearing stale session`);
          if (sessionRole) {
            sessionStorage.removeItem(SESSION_KEY);
          }
          setRoleValid(false);
        }
      } catch (error: any) {
        console.error(`[${timestamp}] DepositAdminPage - Role validation error:`, error);
        setRoleValid(false);
      } finally {
        setIsValidatingRole(false);
      }
    };

    if (identity && actor && !actorLoading) {
      validateAdminRole();
    }
  }, [actor, actorLoading, identity]);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-cyan mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if role validation completed and role is invalid
  if (!isValidatingRole && !roleValid && !actorLoading) {
    return <AccessDeniedScreen />;
  }

  return (
    <DepositPasswordGuard>
      {(actorLoading || isValidatingRole) ? (
        <div className="min-h-screen flex items-center justify-center bg-gaming-texture">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ff-cyan mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isValidatingRole ? 'Validating admin access...' : 'Loading...'}
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </DepositPasswordGuard>
  );
}
